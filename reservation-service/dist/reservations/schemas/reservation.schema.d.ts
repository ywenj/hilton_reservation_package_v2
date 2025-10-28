import { Document } from "mongoose";
export declare enum ReservationStatus {
    Requested = "Requested",
    Confirmed = "Confirmed",
    Seated = "Seated",
    Completed = "Completed",
    Cancelled = "Cancelled"
}
export declare class Reservation extends Document {
    _id: string;
    guestName: string;
    contactPhone: string;
    contactEmail?: string;
    expectedArrival: string;
    tableSize: number;
    status: ReservationStatus;
}
export declare const ReservationSchema: import("mongoose").Schema<Reservation, import("mongoose").Model<Reservation, any, any, any, Document<unknown, any, Reservation> & Reservation & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reservation, Document<unknown, {}, import("mongoose").FlatRecord<Reservation>> & import("mongoose").FlatRecord<Reservation> & Required<{
    _id: string;
}>>;
