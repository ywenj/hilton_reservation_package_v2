import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { ReservationsService } from "../services/reservations.service";
import { Reservation } from "../schemas/reservation.schema";
import { CreateReservationInput } from "../dto/create-reservation.input";
import { UpdateReservationInput } from "../dto/update-reservation.input";
import {
  UsePipes,
  ValidationPipe,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { GqlAuthGuard } from "../../common/auth/gql-auth.guard";
import { JwtUser, UserRole } from "../../common/auth/roles";
import { ReservationStatus } from "../schemas/reservation.schema";

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
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest, UserRole.Employee] }))
  async reservation(@Args("id") id: string, @CurrentUser() user: JwtUser) {
    const r = await this.reservationsService.findById(id);
    if (!r) return null;
    if (user.role === UserRole.Employee || (r as any).userId === user.sub)
      return r as any;
    return null;
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
      guestName: user.name,
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

  @Mutation(() => Reservation)
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest] }))
  async cancelMyReservation(
    @Args("id") id: string,
    @CurrentUser() user: JwtUser
  ) {
    const r = await this.reservationsService.findById(id);
    if (!r || (r as any).userId !== user.sub) {
      throw new NotFoundException("Reservation not found");
    }
    if (
      (r as any).status === ReservationStatus.Cancelled ||
      (r as any).status === ReservationStatus.Completed
    ) {
      return r as any;
    }
    return this.reservationsService.setStatus(id, ReservationStatus.Cancelled);
  }
}
