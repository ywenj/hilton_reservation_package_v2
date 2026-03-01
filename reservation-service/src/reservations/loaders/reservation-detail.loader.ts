import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";
import { ReservationDetailService } from "../services/reservation-detail.service";
import { ReservationDetail } from "../schemas/reservation-detail.schema";

/**
 * Request-scoped DataLoader for ReservationDetail.
 *
 * Scope.REQUEST ensures each GraphQL request gets a fresh DataLoader instance,
 * so the batching & caching is per-request (no stale data across requests).
 *
 * How it solves N+1:
 *   Without DataLoader:  N reservations → N separate DB queries for details
 *   With DataLoader:     N reservations → 1 batched DB query ($in: [...ids])
 */
@Injectable({ scope: Scope.REQUEST })
export class ReservationDetailLoader {
  private readonly loader: DataLoader<string, ReservationDetail | null>;

  constructor(private readonly detailService: ReservationDetailService) {
    this.loader = new DataLoader<string, ReservationDetail | null>(
      async (reservationIds: readonly string[]) => {
        const map = await this.detailService.findByReservationIds([
          ...reservationIds,
        ]);
        // Return results in the same order as the input IDs
        return reservationIds.map((id) => map.get(id) ?? null);
      },
    );
  }

  /** Load detail for a single reservation (batched automatically) */
  async load(reservationId: string): Promise<ReservationDetail | null> {
    return this.loader.load(reservationId);
  }
}
