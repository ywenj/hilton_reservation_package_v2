import { Model } from "mongoose";
import { Reservation, ReservationStatus } from "./schemas/reservation.schema";
import { CreateReservationInput } from "./dto/create-reservation.input";
import { UpdateReservationInput } from "./dto/update-reservation.input";
interface QueryFilters {
    date?: string;
    status?: ReservationStatus | string;
}
export declare class ReservationsService {
    private readonly reservationModel;
    constructor(reservationModel: Model<Reservation>);
    create(input: CreateReservationInput): Promise<Reservation>;
    findById(id: string): Promise<Reservation | null>;
    query(filters: QueryFilters): Promise<Reservation[]>;
    update(id: string, input: UpdateReservationInput): Promise<Reservation>;
    setStatus(id: string, status: ReservationStatus): Promise<Reservation>;
}
export {};
