import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ReservationsService } from './reservations.service';
import { Reservation } from './schemas/reservation.schema';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@Resolver(() => Reservation)
export class ReservationsResolver {
  constructor(private reservationsService: ReservationsService) {}

  @Query(() => [Reservation])
  async reservations(
    @Args('date', { nullable: true }) date?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.reservationsService.query({ date, status });
  }

  @Query(() => Reservation, { nullable: true })
  async reservation(@Args('id') id: string) {
    return this.reservationsService.findById(id);
  }

  @Mutation(() => Reservation)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createReservation(@Args('input') input: CreateReservationInput) {
    return this.reservationsService.create(input);
  }

  @Mutation(() => Reservation)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateReservation(@Args('id') id: string, @Args('input') input: UpdateReservationInput) {
    return this.reservationsService.update(id, input as any);
  }

  @Mutation(() => Reservation)
  async setReservationStatus(@Args('id') id: string, @Args('status') status: string) {
    return this.reservationsService.setStatus(id, status as any);
  }
}
