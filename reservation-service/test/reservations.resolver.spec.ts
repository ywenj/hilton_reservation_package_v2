import { Test } from "@nestjs/testing";
import { ReservationsResolver } from "../src/reservations/resolvers/reservations.resolver";
import { ReservationsService } from "../src/reservations/services/reservations.service";
import { ReservationStatus } from "../src/reservations/schemas/reservation.schema";

describe("ReservationsResolver (unit)", () => {
  let resolver: ReservationsResolver;
  const serviceMock = {
    query: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    setStatus: jest.fn(),
  } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservationsResolver,
        { provide: ReservationsService, useValue: serviceMock },
      ],
    }).compile();
    resolver = moduleRef.get(ReservationsResolver);
    jest.clearAllMocks();
    if ((resolver as any).logger) {
      jest.spyOn((resolver as any).logger, "debug");
      jest.spyOn((resolver as any).logger, "log");
    }
  });

  it("delegates reservations query", async () => {
    serviceMock.query.mockResolvedValue([]);
    const res = await resolver.reservations("2025-01-01", "Requested");
    expect(serviceMock.query).toHaveBeenCalledWith({
      date: "2025-01-01",
      status: "Requested",
    });
    expect(res).toEqual([]);
    if ((resolver as any).logger) {
      expect((resolver as any).logger.debug).toHaveBeenCalled();
    }
  });

  it("delegates myReservations with user id", async () => {
    serviceMock.findByUser.mockResolvedValue([]);
    const res = await resolver.myReservations({
      sub: "u1",
      role: "guest",
    } as any);
    expect(serviceMock.findByUser).toHaveBeenCalledWith("u1");
    expect(res).toEqual([]);
  });

  it("reservation returns null if not found", async () => {
    serviceMock.findById.mockResolvedValue(null);
    const res = await resolver.reservation("r1", {
      sub: "u1",
      role: "guest",
    } as any);
    expect(res).toBeNull();
  });

  it("reservation returns record for employee regardless of owner", async () => {
    const record = { _id: "r1", userId: "other" };
    serviceMock.findById.mockResolvedValue(record);
    const res = await resolver.reservation("r1", {
      sub: "u1",
      role: "employee",
    } as any);
    expect(res).toEqual(record);
  });

  it("createReservation delegates to service with enriched fields", async () => {
    serviceMock.create.mockResolvedValue({ _id: "r2" });
    const input = {
      expectedArrival: "2025-01-02T10:00:00.000Z",
      tableSize: 2,
    } as any;
    const res = await resolver.createReservation(input, {
      sub: "u2",
      name: "Alice",
      email: "a@a",
      phone: "123",
      role: "guest",
    } as any);
    expect(serviceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u2", guestName: "Alice" }),
    );
    expect(res).toEqual({ _id: "r2" });
    if ((resolver as any).logger) {
      expect((resolver as any).logger.log).toHaveBeenCalled();
    }
  });

  it("cancelMyReservation sets status when permitted", async () => {
    const record = {
      _id: "r3",
      userId: "u3",
      status: ReservationStatus.Requested,
    };
    serviceMock.findById.mockResolvedValue(record);
    serviceMock.setStatus.mockResolvedValue({
      _id: "r3",
      status: ReservationStatus.Cancelled,
    });
    const res = await resolver.cancelMyReservation("r3", 1, {
      sub: "u3",
      role: "guest",
    } as any);
    expect(serviceMock.setStatus).toHaveBeenCalledWith(
      "r3",
      ReservationStatus.Cancelled,
    );
    expect(res.status).toBe(ReservationStatus.Cancelled);
  });

  afterAll(() => {
    jest.clearAllTimers();
  });
});
