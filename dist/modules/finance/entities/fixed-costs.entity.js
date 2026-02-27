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
exports.FixedCost = void 0;
const base_entity_1 = require("../../../common/base.entity");
const typeorm_1 = require("typeorm");
let FixedCost = class FixedCost extends base_entity_1.BaseEntity {
    tenantId;
    electricity;
    water;
    gas;
    internet;
    others;
};
exports.FixedCost = FixedCost;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FixedCost.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], FixedCost.prototype, "electricity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], FixedCost.prototype, "water", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], FixedCost.prototype, "gas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], FixedCost.prototype, "internet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FixedCost.prototype, "others", void 0);
exports.FixedCost = FixedCost = __decorate([
    (0, typeorm_1.Entity)('fixed_costs')
], FixedCost);
//# sourceMappingURL=fixed-costs.entity.js.map