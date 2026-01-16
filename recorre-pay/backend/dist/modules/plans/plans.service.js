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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PlansService = class PlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.plan.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { subscriptions: true },
                },
            },
        });
    }
    async findOne(id, tenantId) {
        const plan = await this.prisma.plan.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { subscriptions: true },
                },
            },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        return plan;
    }
    async create(tenantId, dto) {
        return this.prisma.plan.create({
            data: {
                tenantId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                interval: dto.interval,
                intervalCount: dto.intervalCount || 1,
            },
        });
    }
    async update(id, tenantId, dto) {
        await this.findOne(id, tenantId);
        return this.prisma.plan.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.plan.update({
            where: { id },
            data: { isActive: false },
        });
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlansService);
//# sourceMappingURL=plans.service.js.map