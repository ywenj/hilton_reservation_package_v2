import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Reservation, ReservationSchema } from "./schemas/reservation.schema";
import { ReservationsService } from "./services/reservations.service";
import { ReservationsResolver } from "./resolvers/reservations.resolver";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  providers: [ReservationsService, ReservationsResolver],
  exports: [ReservationsService],
})
export class ReservationsModule {}
