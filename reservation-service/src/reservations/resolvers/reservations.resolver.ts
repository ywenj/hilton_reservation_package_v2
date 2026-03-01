import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { ReservationsService } from "../services/reservations.service";
import { Logger } from "@nestjs/common";
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
  private readonly logger = new Logger(ReservationsResolver.name);

  @Query(() => [Reservation])
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Employee] }))
  async reservations(
    @Args("date", { nullable: true }) date?: string,
    @Args("status", { nullable: true }) status?: string,
  ) {
    this.logger.debug(`reservations query date=${date} status=${status}`);
    return this.reservationsService.query({ date, status });
  }

  @Query(() => [Reservation])
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest] }))
  async myReservations(@CurrentUser() user: JwtUser) {
    this.logger.debug(`myReservations user=${user.sub}`);
    return this.reservationsService.findByUser(user.sub);
  }

  @Query(() => Reservation, { nullable: true })
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest, UserRole.Employee] }))
  async reservation(@Args("id") id: string, @CurrentUser() user: JwtUser) {
    const r = await this.reservationsService.findById(id);
    if (!r) return null;
    if (user.role === UserRole.Employee || r.userId === user.sub) return r;
    return null;
  }

  @Mutation(() => Reservation)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest] }))
  async createReservation(
    @Args("input") input: CreateReservationInput,
    @CurrentUser() user: JwtUser,
  ) {
    this.logger.log(
      `createReservation user=${user.sub} tableSize=${input.tableSize}`,
    );
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
    @Args("input") input: UpdateReservationInput,
  ) {
    this.logger.log(`updateReservation id=${id}`);
    return this.reservationsService.update(id, input as any);
  }

  @Mutation(() => Reservation)
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Employee] }))
  async setReservationStatus(
    @Args("id") id: string,
    @Args("status") status: string,
    @Args("version", { type: () => Int }) version: number,
  ) {
    this.logger.log(`setReservationStatus id=${id} status=${status} version=${version}`);
    return this.reservationsService.setStatus(id, status as any, version);
  }

  @Mutation(() => Reservation)
  @UseGuards(new GqlAuthGuard({ roles: [UserRole.Guest] }))
  async cancelMyReservation(
    @Args("id") id: string,
    @Args("version", { type: () => Int }) version: number,
    @CurrentUser() user: JwtUser,
  ) {
    const r = await this.reservationsService.findById(id);
    if (!r || r.userId !== user.sub) {
      throw new NotFoundException("Reservation not found");
    }
    if (
      r.status === ReservationStatus.Cancelled ||
      r.status === ReservationStatus.Completed
    ) {
      return r;
    }
    this.logger.log(`cancelMyReservation id=${id} user=${user.sub} version=${version}`);
    return this.reservationsService.setStatus(id, ReservationStatus.Cancelled, version);
  }
}
