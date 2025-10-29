export type ReservationStatus =
  | "Requested"
  | "Confirmed"
  | "Seated"
  | "Completed"
  | "Cancelled";

export interface Reservation {
  _id: string;
  guestName: string;
  contactPhone: string;
  contactEmail?: string | null;
  expectedArrival: string;
  tableSize: number;
  status: ReservationStatus;
}

export interface CreateReservationInput {
  guestName: string;
  contactPhone: string;
  contactEmail?: string;
  expectedArrival: string;
  tableSize: number;
}

export interface UpdateReservationInput {
  guestName?: string;
  contactPhone?: string;
  contactEmail?: string;
  expectedArrival?: string;
  tableSize?: number;
}

export const statusColors: Record<ReservationStatus, string> = {
  Requested: "#888",
  Confirmed: "#2d7ef7",
  Seated: "#8c4cd9",
  Completed: "#2e8b57",
  Cancelled: "#d9534f",
};
