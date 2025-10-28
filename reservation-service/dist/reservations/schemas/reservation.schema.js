"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationSchema = exports.Reservation = exports.ReservationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const graphql_1 = require("@nestjs/graphql");
const mongoose_2 = require("mongoose");
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["Requested"] = "Requested";
    ReservationStatus["Confirmed"] = "Confirmed";
    ReservationStatus["Seated"] = "Seated";
    ReservationStatus["Completed"] = "Completed";
    ReservationStatus["Cancelled"] = "Cancelled";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
(0, graphql_1.registerEnumType)(ReservationStatus, { name: "ReservationStatus" });
let Reservation = class Reservation extends mongoose_2.Document {
};
exports.Reservation = Reservation;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Reservation.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Reservation.prototype, "guestName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Reservation.prototype, "contactPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Reservation.prototype, "contactEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Reservation.prototype, "expectedArrival", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Reservation.prototype, "tableSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ReservationStatus,
        default: ReservationStatus.Requested,
    }),
    (0, graphql_1.Field)(() => ReservationStatus),
    __metadata("design:type", String)
], Reservation.prototype, "status", void 0);
exports.Reservation = Reservation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true }),
    (0, graphql_1.ObjectType)()
], Reservation);
exports.ReservationSchema = mongoose_1.SchemaFactory.createForClass(Reservation);
//# sourceMappingURL=reservation.schema.js.map