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
exports.SchedulerTask = void 0;
const base_entity_1 = require("../../../common/base.entity");
const typeorm_1 = require("typeorm");
let SchedulerTask = class SchedulerTask extends base_entity_1.BaseEntity {
    tenantId;
    userId;
    executionDate;
    description;
    action;
    message;
};
exports.SchedulerTask = SchedulerTask;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SchedulerTask.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SchedulerTask.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SchedulerTask.prototype, "executionDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SchedulerTask.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SchedulerTask.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SchedulerTask.prototype, "message", void 0);
exports.SchedulerTask = SchedulerTask = __decorate([
    (0, typeorm_1.Entity)('scheduler_tasks')
], SchedulerTask);
//# sourceMappingURL=cron-job.entity.js.map