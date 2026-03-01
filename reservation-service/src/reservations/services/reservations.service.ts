import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Reservation, ReservationStatus } from "../schemas/reservation.schema";
import { CreateReservationInput } from "../dto/create-reservation.input";
import { UpdateReservationInput } from "../dto/update-reservation.input";

interface QueryFilters {
  date?: string;
  status?: ReservationStatus | string;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
  ) {}
  private readonly logger = new Logger(ReservationsService.name);

  async create(
    input: CreateReservationInput & {
      userId?: string;
      guestName?: string;
      contactEmail?: string;
      contactPhone?: string;
    },
  ): Promise<Reservation> {
    this.logger.debug(
      `Create reservation userId=${input.userId} tableSize=${input.tableSize}`,
    );
    const created = await this.reservationModel.create({
      ...input,
      status: ReservationStatus.Requested,
    });
    this.logger.log(`Reservation created id=${created._id}`);
    return created;
  }

  async findById(id: string): Promise<Reservation | null> {
    const r = await this.reservationModel.findById(id).exec();
    if (!r) this.logger.debug(`Reservation not found id=${id}`);
    return r;
  }

  async query(filters: QueryFilters): Promise<Reservation[]> {
    this.logger.debug(
      `Query reservations date=${filters.date} status=${filters.status}`,
    );
    const mongoFilters: any = {};
    if (filters.date) {
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
    const res = await this.reservationModel
      .find(mongoFilters)
      .sort({ expectedArrival: 1 })
      .exec();
    this.logger.debug(`Query result count=${res.length}`);
    return res;
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    this.logger.debug(`FindByUser userId=${userId}`);
    const res = await this.reservationModel
      .find({ userId })
      .sort({ expectedArrival: 1 })
      .exec();
    this.logger.debug(`FindByUser count=${res.length}`);
    return res;
  }

  async update(
    id: string,
    input: UpdateReservationInput,
  ): Promise<Reservation> {
    const { version, ...updateFields } = input;
    const updated = await this.reservationModel
      .findOneAndUpdate(
        { _id: id, __v: version },
        { $set: updateFields, $inc: { __v: 1 } },
        { new: true },
      )
      .exec();
    if (!updated) {
      const exists = await this.reservationModel.findById(id).exec();
      if (!exists) throw new NotFoundException("Reservation not found");
      throw new ConflictException(
        "Reservation has been modified by another user. Please refresh and try again.",
      );
    }
    this.logger.log(`Reservation updated id=${id} newVersion=${updated.__v}`);
    return updated;
  }

  async setStatus(
    id: string,
    status: ReservationStatus,
    version: number,
  ): Promise<Reservation> {
    const updated = await this.reservationModel
      .findOneAndUpdate(
        { _id: id, __v: version },
        { $set: { status }, $inc: { __v: 1 } },
        { new: true },
      )
      .exec();
    if (!updated) {
      const exists = await this.reservationModel.findById(id).exec();
      if (!exists) throw new NotFoundException("Reservation not found");
      throw new ConflictException(
        "Reservation has been modified by another user. Please refresh and try again.",
      );
    }
    this.logger.log(
      `Status changed id=${id} status=${status} newVersion=${updated.__v}`,
    );
    return updated;
  }
}
