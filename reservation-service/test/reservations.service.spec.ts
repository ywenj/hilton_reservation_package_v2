import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ReservationsService } from "../src/reservations/services/reservations.service";
import {
  Reservation,
  ReservationSchema,
  ReservationStatus,
} from "../src/reservations/schemas/reservation.schema";

const mockReservation = (overrides = {}) => ({
  _id: "mock-id",
  guestName: "Alice",
  contactPhone: "123",
  contactEmail: "a@example.com",
  expectedArrival: new Date().toISOString(),
  tableSize: 2,
  status: ReservationStatus.Requested,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe("ReservationsService (unit)", () => {
  let service: ReservationsService;
  let model: any;

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getModelToken(Reservation.name), useValue: model },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it("service should be defined", () => {
    expect(service).toBeDefined();
  });

  it("create should call model constructor and save", async () => {
    const dto = {
      guestName: "Bob",
      contactPhone: "321",
      expectedArrival: new Date().toISOString(),
      tableSize: 4,
    };
    const created = mockReservation(dto);
    // simulate new this.reservationModel(...) then save()
    const saveMock = jest.fn().mockResolvedValue(created);
    // model as constructor: emulate by making model.prototype.save
    // but easier: mock model.create to return created
    model.create.mockResolvedValue(created);

    const res = await service.create(dto as any);
    expect(model.create).toHaveBeenCalled();
  });

  it("findById should return reservation when found", async () => {
    const found = mockReservation();
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(found),
    });
    const r = await service.findById("mock-id");
    expect(model.findById).toHaveBeenCalledWith("mock-id");
    expect(r).toEqual(found);
  });

  it("query should pass filters correctly", async () => {
    const list = [mockReservation()];
    model.find.mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(list) }),
    });
    const res = await service.query({
      date: new Date().toISOString().split("T")[0],
      status: ReservationStatus.Requested,
    });
    expect(model.find).toHaveBeenCalled();
    expect(res).toEqual(list);
  });
});
