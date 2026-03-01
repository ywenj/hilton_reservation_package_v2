import { Resolver, ResolveField, Parent } from "@nestjs/graphql";
import { Reservation } from "../schemas/reservation.schema";
import { ReservationDetail } from "../schemas/reservation-detail.schema";
import { ReservationDetailLoader } from "../loaders/reservation-detail.loader";

/**
 * Separate field resolver for Reservation.
 *
 * When a client queries the `detail` field on any Reservation,
 * this resolver uses DataLoader to batch all detail lookups
 * into a single DB query, avoiding the N+1 problem.
 *
 * Example query:
 *   query {
 *     reservations {
 *       _id
 *       guestName
 *       detail {            ← triggers this resolver
 *         seatingPreference
 *         occasion
 *         dietaryRequirements
 *         specialRequests
 *       }
 *     }
 *   }
 */
@Resolver(() => Reservation)
export class ReservationDetailFieldResolver {
  constructor(private readonly detailLoader: ReservationDetailLoader) {}

  @ResolveField(() => ReservationDetail, {
    nullable: true,
    description: "Reservation detail loaded via DataLoader (N+1 safe)",
  })
  async detail(
    @Parent() reservation: Reservation,
  ): Promise<ReservationDetail | null> {
    return this.detailLoader.load(reservation._id.toString());
  }
}
