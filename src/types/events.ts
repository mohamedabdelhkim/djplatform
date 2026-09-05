export type EventStatus = "confirmed" | "sold-out" | "cancelled" | "postponed";

export type EventTimeframe = "upcoming" | "past";

export interface TourEvent {
  readonly id: string;
  readonly date: string; // ISO format: YYYY-MM-DD
  readonly time?: string;
  readonly venue: string;
  readonly city: string;
  readonly country: string;
  readonly eventName: string;
  readonly status: EventStatus;
  readonly ticketUrl?: string;
  readonly timeframe: EventTimeframe;
}
