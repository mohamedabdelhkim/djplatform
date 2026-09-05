import React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-20">
      <Container className="text-center space-y-6">
        <div className="inline-block border border-signal px-3 py-1 font-mono text-xs text-signal uppercase tracking-widest">
          [SIGNAL LOST // 404]
        </div>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-text-primary sm:text-7xl">
          Page Not Found
        </h1>
        <p className="max-w-md mx-auto font-body text-sm text-text-muted">
          The requested coordinate or transmission channel does not exist on this platform.
        </p>
        <div className="pt-4">
          <Link href="/" tabIndex={-1}>
            <Button variant="primary" size="md">
              Return to Platform
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
