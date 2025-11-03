import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { ReservationsService } from "./reservations.service";
import { Reservation } from "./schemas/reservation.schema";
import { CreateReservationInput } from "./dto/create-reservation.input";
import { UpdateReservationInput } from "./dto/update-reservation.input";
import { UsePipes, ValidationPipe, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { GqlAuthGuard, RequireRoles } from "../common/auth/gql-auth.guard";
import { JwtUser, UserRole } from "../common/auth/roles";

@Resolver(() => Reservation)
export class ReservationsResolver {
  constructor(private reservationsService: ReservationsService) {}

  @Query(() => [Reservation])
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Employee] }))
  async reservations(
    @Args("date", { nullable: true }) date?: string,
    @Args("status", { nullable: true }) status?: string
  ) {
    return this.reservationsService.query({ date, status });
  }

  @Query(() => [Reservation])
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest] }))
  async myReservations(@CurrentUser() user: JwtUser) {
    return this.reservationsService.findByUser(user.sub);
  }

  @Query(() => Reservation, { nullable: true })
  async reservation(@Args("id") id: string) {
    return this.reservationsService.findById(id);
  }

  @Mutation(() => Reservation)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest] }))
  async createReservation(
    @Args("input") input: CreateReservationInput,
    @CurrentUser() user: JwtUser
  ) {
    return this.reservationsService.create({
      ...input,
      userId: user.sub,
      contactEmail: user.email,
      contactPhone: user.phone,
    });
  }

  @Mutation(() => Reservation)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest] }))
  async updateReservation(
    @Args("id") id: string,
    @Args("input") input: UpdateReservationInput
  ) {
    return this.reservationsService.update(id, input as any);
  }

  @Mutation(() => Reservation)
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Employee] }))
  async setReservationStatus(
    @Args("id") id: string,
    @Args("status") status: string
  ) {
    return this.reservationsService.setStatus(id, status as any);
  }
}
