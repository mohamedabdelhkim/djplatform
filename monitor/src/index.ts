/**
 * Uptime monitor for the booking platform.
 *
 * Runs on a cron trigger and checks the two things that actually matter: the
 * site serves, and /api/booking still behaves. Both outages on 6 September were
 * found only because someone happened to be testing at the time - nothing was
 * watching, so a third would have stayed invisible until a promoter complained.
 *
 * Deliberately separate from the site's own Worker: a monitor that shares a
 * deployment with the thing it monitors goes down with it.
 */

interface Env {
  /** Shared with the booking Function purely for the alert-cooldown key. */
  MONITOR_STATE?: KVNamespace;
  RESEND_API_KEY?: string;
  ALERT_EMAIL?: string;
  ALERT_FROM?: string;
  SITE_ORIGIN?: string;
}

const DEFAULT_ORIGIN = "https://djplatform.pages.dev";

/** Don't re-alert about the same ongoing outage more often than this. */
const ALERT_COOLDOWN_SECONDS = 3600;
const COOLDOWN_KEY = "monitor:last-alert";

interface CheckResult {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
}

async function checkPage(origin: string, path: string): Promise<CheckResult> {
  const url = `${origin}${path}`;
  try {
    const res = await fetch(url, { method: "GET" });
    return {
      name: `GET ${path || "/"}`,
      ok: res.status === 200,
      detail: `HTTP ${res.status}`,
    };
  } catch (error) {
    return { name: `GET ${path || "/"}`, ok: false, detail: `request failed: ${error}` };
  }
}

/**
 * Probes the booking endpoint with a deliberately invalid body.
 *
 * A 400 means the Function is running and validating - no email is dispatched
 * and no Resend quota is spent. A 5xx means the Function is broken; a 200 would
 * mean validation has stopped working, which is its own kind of broken.
 */
async function checkBookingEndpoint(origin: string): Promise<CheckResult> {
  try {
    const res = await fetch(`${origin}/api/booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "", message: "" }),
    });

    if (res.status === 400) {
      return { name: "POST /api/booking", ok: true, detail: "HTTP 400 (validating)" };
    }
    if (res.status === 429) {
      // The monitor tripped the throttle. Not an outage.
      return { name: "POST /api/booking", ok: true, detail: "HTTP 429 (throttled)" };
    }
    const body = (await res.text()).slice(0, 200);
    return {
      name: "POST /api/booking",
      ok: false,
      detail: `HTTP ${res.status} — expected 400. Body: ${body}`,
    };
  } catch (error) {
    return { name: "POST /api/booking", ok: false, detail: `request failed: ${error}` };
  }
}

async function shouldAlert(store: KVNamespace | undefined): Promise<boolean> {
  if (!store) return true;
  try {
    const last = await store.get(COOLDOWN_KEY);
    return last === null;
  } catch {
    // If the cooldown store is unreadable, alerting is the safer failure.
    return true;
  }
}

async function markAlerted(store: KVNamespace | undefined): Promise<void> {
  if (!store) return;
  try {
    await store.put(COOLDOWN_KEY, new Date().toISOString(), {
      expirationTtl: ALERT_COOLDOWN_SECONDS,
    });
  } catch {
    // A missed cooldown means a duplicate alert, which is harmless.
  }
}

async function sendAlert(env: Env, origin: string, failures: readonly CheckResult[]): Promise<void> {
  if (!env.RESEND_API_KEY || !env.ALERT_EMAIL) {
    console.error("Monitor cannot alert: RESEND_API_KEY or ALERT_EMAIL is not set.");
    return;
  }

  const lines = failures.map((f) => `  ${f.name}\n    ${f.detail}`).join("\n\n");
  const text = [
    `The booking platform failed a health check.`,
    ``,
    `Site: ${origin}`,
    `Time: ${new Date().toISOString()}`,
    ``,
    `Failed:`,
    lines,
    ``,
    `Checks run every 15 minutes. You will not get another alert about this`,
    `for an hour, so this is not resolved just because the mail stops.`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.ALERT_FROM || "Platform Monitor <onboarding@resend.dev>",
      to: [env.ALERT_EMAIL],
      subject: `[ALERT] Booking platform check failed (${failures.length})`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("Monitor could not send its alert:", await res.text());
  }
}

async function runChecks(env: Env): Promise<{ origin: string; results: CheckResult[] }> {
  const origin = env.SITE_ORIGIN || DEFAULT_ORIGIN;
  const results = await Promise.all([
    checkPage(origin, "/"),
    checkPage(origin, "/press"),
    checkBookingEndpoint(origin),
  ]);
  return { origin, results };
}

/** Shared by the cron and the manual trigger, so the alert path is the same one
 *  a real outage would take - a monitor whose alerting cannot be exercised is a
 *  monitor nobody has actually tested. */
async function alertIfDue(
  env: Env,
  origin: string,
  failures: readonly CheckResult[]
): Promise<string> {
  console.error("Monitor: checks failed —", JSON.stringify(failures));
  if (!(await shouldAlert(env.MONITOR_STATE))) {
    console.log("Monitor: alert suppressed, still inside the cooldown window.");
    return "suppressed (cooldown)";
  }
  await sendAlert(env, origin, failures);
  await markAlerted(env.MONITOR_STATE);
  return "sent";
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const { origin, results } = await runChecks(env);
        const failures = results.filter((r) => !r.ok);

        if (failures.length === 0) {
          console.log("Monitor: all checks passed.", results.map((r) => r.detail).join(" · "));
          return;
        }

        await alertIfDue(env, origin, failures);
      })()
    );
  },

  /**
   * Manual trigger, so the monitor can be verified without waiting for cron.
   * It takes the same alert path as the cron - including the cooldown, which
   * also stops this public URL from being used to send mail repeatedly.
   */
  async fetch(_request: Request, env: Env): Promise<Response> {
    const { origin, results } = await runChecks(env);
    const failures = results.filter((r) => !r.ok);
    const healthy = failures.length === 0;

    const alert = healthy ? "not needed" : await alertIfDue(env, origin, failures);

    return new Response(
      JSON.stringify(
        { healthy, alert, origin, checkedAt: new Date().toISOString(), results },
        null,
        2
      ),
      {
        status: healthy ? 200 : 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
