import { ReservationsService } from './reservations.service';
import { Reservation } from './schemas/reservation.schema';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
export declare class ReservationsResolver {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    reservations(date?: string, status?: string): Promise<Reservation[]>;
    reservation(id: string): Promise<Reservation | null>;
    createReservation(input: CreateReservationInput): Promise<Reservation>;
    updateReservation(id: string, input: UpdateReservationInput): Promise<Reservation>;
    setReservationStatus(id: string, status: string): Promise<Reservation>;
}
