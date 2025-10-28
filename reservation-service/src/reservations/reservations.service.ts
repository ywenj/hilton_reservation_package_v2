import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Reservation, ReservationStatus } from "./schemas/reservation.schema";
import { CreateReservationInput } from "./dto/create-reservation.input";
import { UpdateReservationInput } from "./dto/update-reservation.input";

interface QueryFilters {
  date?: string;
  status?: ReservationStatus | string;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>
  ) {}

  async create(input: CreateReservationInput): Promise<Reservation> {
    // expectedArrival is ISO string already
    const created = await this.reservationModel.create({
      ...input,
      status: ReservationStatus.Requested,
    });
    return created;
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.reservationModel.findById(id).exec();
  }

  async query(filters: QueryFilters): Promise<Reservation[]> {
    const mongoFilters: any = {};
    if (filters.date) {
      // match reservations whose expectedArrival date portion matches filters.date (YYYY-MM-DD)
      const dayStart = new Date(filters.date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      mongoFilters.expectedArrival = {
        $gte: dayStart.toISOString(),
        $lt: dayEnd.toISOString(),
      };
    }
    if (filters.status) {
      mongoFilters.status = filters.status;
    }
    return this.reservationModel
      .find(mongoFilters)
      .sort({ expectedArrival: 1 })
      .exec();
  }

  async update(
    id: string,
    input: UpdateReservationInput
  ): Promise<Reservation> {
    const updated = await this.reservationModel
      .findByIdAndUpdate(id, { $set: input }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException("Reservation not found");
    return updated;
  }

  async setStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const updated = await this.reservationModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException("Reservation not found");
    return updated;
  }
}
