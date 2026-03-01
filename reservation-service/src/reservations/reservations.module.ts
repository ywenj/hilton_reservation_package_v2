import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Reservation, ReservationSchema } from "./schemas/reservation.schema";
import {
  ReservationDetail,
  ReservationDetailSchema,
} from "./schemas/reservation-detail.schema";
import { ReservationsService } from "./services/reservations.service";
import { ReservationDetailService } from "./services/reservation-detail.service";
import { ReservationsResolver } from "./resolvers/reservations.resolver";
import { ReservationDetailFieldResolver } from "./resolvers/reservation-detail-field.resolver";
import { ReservationDetailLoader } from "./loaders/reservation-detail.loader";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: ReservationDetail.name, schema: ReservationDetailSchema },
    ]),
  ],
  providers: [
    ReservationsService,
    ReservationDetailService,
    ReservationDetailLoader,
    ReservationsResolver,
    ReservationDetailFieldResolver,
  ],
  exports: [ReservationsService],
})
export class ReservationsModule {}
