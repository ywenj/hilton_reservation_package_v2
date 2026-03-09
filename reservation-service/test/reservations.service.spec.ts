import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { ReservationsService } from "../src/reservations/services/reservations.service";
import {
  Reservation,
  ReservationStatus,
} from "../src/reservations/schemas/reservation.schema";

type Point = [number, number];

type KeyValue = [string, any];
type Entry = [string, number];

const entries: Entry[] = [
  ["count", 5],
  ["age", 25],
];
entries.push(["name", 5] as Entry); // Type assertion to bypass type error
const map = new Map<string, number>(entries);

/**
 * 单元测试中 **不需要** 连接真实数据库。
 *
 * 做法：用 jest.fn() 构造一个假的 Mongoose Model，替换掉真实的 Model 注入。
 * - `new model(data)` → 返回带 `.save()` 的普通对象
 * - `model.findById / find / findOneAndUpdate` → 返回可链式调用 `.exec()` 的 mock
 *
 * 这样所有数据库交互都在内存中完成，测试快速且可重复。
 */
const mockReservation = (overrides = {}) => ({
  _id: "mock-id",
  __v: 0,
  guestName: "Alice",
  contactPhone: "123",
  contactEmail: "a@example.com",
  expectedArrival: new Date().toISOString(),
  tableSize: 2,
  status: ReservationStatus.Requested,
  save: jest.fn(),
  ...overrides,
});

/**
 * Build a constructor-function mock that behaves like a Mongoose Model:
 *   - `new model(data)` returns an instance with a `.save()` stub
 *   - Static helpers (findById, find, findOneAndUpdate) are also present
 */
function createModelMock() {
  const model: any = jest.fn().mockImplementation((data: any) => {
    const doc = { ...mockReservation(), ...data, save: jest.fn() };
    doc.save.mockResolvedValue(doc);
    return doc;
  });
  model.create = jest.fn();
  model.findById = jest.fn();
  model.find = jest.fn();
  model.findOneAndUpdate = jest.fn();
  return model;
}

describe("ReservationsService (unit)", () => {
  let service: ReservationsService;
  let model: any;

  beforeEach(async () => {
    model = createModelMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getModelToken(Reservation.name), useValue: model },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    // Silence logger output during tests
    jest.spyOn((service as any).logger, "debug").mockImplementation();
    jest.spyOn((service as any).logger, "log").mockImplementation();
  });

  // ---------- create ----------

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("create should construct a new document and call save", async () => {
    const dto = {
      guestName: "Bob",
      contactPhone: "321",
      expectedArrival: new Date().toISOString(),
      tableSize: 4,
    };

    const result = await service.create(dto);

    // model was called as a constructor
    expect(model).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        status: ReservationStatus.Requested,
      }),
    );
    // save was called on the created document
    expect(result.save).toHaveBeenCalled();
    expect((service as any).logger.debug).toHaveBeenCalled();
    expect((service as any).logger.log).toHaveBeenCalled();
  });

  // ---------- findById ----------

  it("findById should return reservation when found", async () => {
    const found = mockReservation();
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(found),
    });
    const r = await service.findById("mock-id");
    expect(model.findById).toHaveBeenCalledWith("mock-id");
    expect(r).toEqual(found);
  });

  it("findById should return null and log debug when not found", async () => {
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    const r = await service.findById("nonexistent");
    expect(r).toBeNull();
    expect((service as any).logger.debug).toHaveBeenCalledWith(
      expect.stringContaining("not found"),
    );
  });

  // ---------- query ----------

  it("query should build date range filter when date is provided", async () => {
    const list = [mockReservation()];
    const sortMock = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
    model.find.mockReturnValue({ sort: sortMock });

    const date = "2026-03-04";
    const res = await service.query({ date });

    const filterArg = model.find.mock.calls[0][0];
    expect(filterArg.expectedArrival).toBeDefined();
    expect(filterArg.expectedArrival.$gte).toBeDefined();
    expect(filterArg.expectedArrival.$lt).toBeDefined();
    // $gte should be the start of the given day, $lt the next day
    expect(new Date(filterArg.expectedArrival.$gte).toISOString()).toContain(
      "2026-03-04",
    );
    expect(new Date(filterArg.expectedArrival.$lt).toISOString()).toContain(
      "2026-03-05",
    );
    expect(res).toEqual(list);
  });

  it("query should build status filter when status is provided", async () => {
    const list = [mockReservation()];
    const sortMock = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
    model.find.mockReturnValue({ sort: sortMock });

    await service.query({ status: ReservationStatus.Approved });

    const filterArg = model.find.mock.calls[0][0];
    expect(filterArg.status).toBe(ReservationStatus.Approved);
  });

  it("query with no filters should pass empty filter object", async () => {
    model.find.mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    });

    const res = await service.query({});

    const filterArg = model.find.mock.calls[0][0];
    expect(filterArg).toEqual({});
    expect(res).toEqual([]);
  });

  // ---------- findByUser ----------

  it("findByUser should filter by userId and sort by expectedArrival", async () => {
    const list = [mockReservation({ userId: "user-1" })];
    const sortMock = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
    model.find.mockReturnValue({ sort: sortMock });

    const res = await service.findByUser("user-1");

    expect(model.find).toHaveBeenCalledWith({ userId: "user-1" });
    expect(sortMock).toHaveBeenCalledWith({ expectedArrival: 1 });
    expect(res).toEqual(list);
  });

  it("findByUser should return empty array when user has no reservations", async () => {
    model.find.mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    });

    const res = await service.findByUser("no-reservations-user");
    expect(res).toEqual([]);
  });

  // ---------- update ----------

  it("update should apply fields with optimistic locking", async () => {
    const updated = mockReservation({ __v: 1, tableSize: 6 });
    model.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updated),
    });

    const result = await service.update("mock-id", {
      version: 0,
      tableSize: 6,
    });

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "mock-id", __v: 0 },
      { $set: { tableSize: 6 }, $inc: { __v: 1 } },
      { new: true },
    );
    expect(result).toEqual(updated);
    expect((service as any).logger.log).toHaveBeenCalledWith(
      expect.stringContaining("updated"),
    );
  });

  it("update should throw NotFoundException when reservation does not exist", async () => {
    model.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.update("nonexistent", { version: 0, tableSize: 4 }),
    ).rejects.toThrow(NotFoundException);
  });

  it("update should throw ConflictException on version mismatch", async () => {
    model.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    // The reservation exists but version doesn't match
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockReservation({ __v: 5 })),
    });

    await expect(
      service.update("mock-id", { version: 0, tableSize: 4 }),
    ).rejects.toThrow(ConflictException);
  });

  // ---------- setStatus ----------

  it("setStatus should update the status with optimistic locking", async () => {
    const updated = mockReservation({
      __v: 1,
      status: ReservationStatus.Approved,
    });
    model.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updated),
    });

    const result = await service.setStatus(
      "mock-id",
      ReservationStatus.Approved,
      0,
    );

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "mock-id", __v: 0 },
      { $set: { status: ReservationStatus.Approved }, $inc: { __v: 1 } },
      { new: true },
    );
    expect(result.status).toBe(ReservationStatus.Approved);
    expect((service as any).logger.log).toHaveBeenCalledWith(
      expect.stringContaining("Status changed"),
    );
  });

  it("setStatus should throw NotFoundException when reservation does not exist", async () => {
    model.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.setStatus("nonexistent", ReservationStatus.Cancelled, 0),
    ).rejects.toThrow(NotFoundException);
  });

  it("setStatus should throw ConflictException on version mismatch", async () => {
    model.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockReservation({ __v: 3 })),
    });

    await expect(
      service.setStatus("mock-id", ReservationStatus.Cancelled, 0),
    ).rejects.toThrow(ConflictException);
  });
});
