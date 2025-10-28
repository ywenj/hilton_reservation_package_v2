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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const reservations_service_1 = require("./reservations.service");
const reservation_schema_1 = require("./schemas/reservation.schema");
const create_reservation_input_1 = require("./dto/create-reservation.input");
const update_reservation_input_1 = require("./dto/update-reservation.input");
const common_1 = require("@nestjs/common");
let ReservationsResolver = class ReservationsResolver {
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    async reservations(date, status) {
        return this.reservationsService.query({ date, status });
    }
    async reservation(id) {
        return this.reservationsService.findById(id);
    }
    async createReservation(input) {
        return this.reservationsService.create(input);
    }
    async updateReservation(id, input) {
        return this.reservationsService.update(id, input);
    }
    async setReservationStatus(id, status) {
        return this.reservationsService.setStatus(id, status);
    }
};
exports.ReservationsResolver = ReservationsResolver;
__decorate([
    (0, graphql_1.Query)(() => [reservation_schema_1.Reservation]),
    __param(0, (0, graphql_1.Args)('date', { nullable: true })),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReservationsResolver.prototype, "reservations", null);
__decorate([
    (0, graphql_1.Query)(() => reservation_schema_1.Reservation, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsResolver.prototype, "reservation", null);
__decorate([
    (0, graphql_1.Mutation)(() => reservation_schema_1.Reservation),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reservation_input_1.CreateReservationInput]),
    __metadata("design:returntype", Promise)
], ReservationsResolver.prototype, "createReservation", null);
__decorate([
    (0, graphql_1.Mutation)(() => reservation_schema_1.Reservation),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reservation_input_1.UpdateReservationInput]),
    __metadata("design:returntype", Promise)
], ReservationsResolver.prototype, "updateReservation", null);
__decorate([
    (0, graphql_1.Mutation)(() => reservation_schema_1.Reservation),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReservationsResolver.prototype, "setReservationStatus", null);
exports.ReservationsResolver = ReservationsResolver = __decorate([
    (0, graphql_1.Resolver)(() => reservation_schema_1.Reservation),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsResolver);
//# sourceMappingURL=reservations.resolver.js.map