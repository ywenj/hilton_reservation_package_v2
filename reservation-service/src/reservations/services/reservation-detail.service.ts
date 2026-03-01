import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReservationDetail } from "../schemas/reservation-detail.schema";

@Injectable()
export class ReservationDetailService {
  constructor(
    @InjectModel(ReservationDetail.name)
    private readonly detailModel: Model<ReservationDetail>,
  ) {}
  private readonly logger = new Logger(ReservationDetailService.name);

  /**
   * Batch-load details for multiple reservation IDs in a single query.
   * Returns a Map keyed by reservationId for O(1) lookups.
   */
  async findByReservationIds(
    reservationIds: string[],
  ): Promise<Map<string, ReservationDetail>> {
    this.logger.debug(
      `Batch loading details for ${reservationIds.length} reservations`,
    );
    const details = await this.detailModel
      .find({ reservationId: { $in: reservationIds } })
      .exec();

    const map = new Map<string, ReservationDetail>();
    for (const detail of details) {
      map.set(detail.reservationId.toString(), detail);
    }
    return map;
  }
}
