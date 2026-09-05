export type BookingBudgetRange =
  | "<1000"
  | "1000-2500"
  | "2500-5000"
  | "5000-10000"
  | "10000+";

export interface BookingRequest {
  readonly name: string;
  readonly email: string;
  readonly organization: string;
  readonly eventName: string;
  readonly eventDate: string; // ISO date format: YYYY-MM-DD
  readonly location: string;
  readonly budget: BookingBudgetRange | string;
  readonly message: string;
  readonly websiteUrl?: string;
}

export type BookingSubmissionStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";

export interface BookingResponse {
  readonly success: boolean;
  readonly message: string;
}
