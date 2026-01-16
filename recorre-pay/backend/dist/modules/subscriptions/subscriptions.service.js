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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, options = {}) {
        const { page = 1, perPage = 10, status, customerId } = options;
        const skip = (page - 1) * perPage;
        const where = {
            customer: { tenantId },
        };
        if (status) {
            where.status = status;
        }
        if (customerId) {
            where.customerId = customerId;
        }
        const [subscriptions, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true,
                    plan: true,
                },
            }),
            this.prisma.subscription.count({ where }),
        ]);
        return {
            data: subscriptions,
            meta: {
                total,
                page,
                perPage,
                totalPages: Math.ceil(total / perPage),
            },
        };
    }
    async findOne(id, tenantId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                id,
                customer: { tenantId },
            },
            include: {
                customer: true,
                plan: true,
                payments: {
                    orderBy: { dueDate: 'desc' },
                    take: 10,
                },
            },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Assinatura não encontrada');
        }
        return subscription;
    }
    async create(tenantId, dto) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: dto.customerId, tenantId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Cliente não encontrado');
        }
        const plan = await this.prisma.plan.findFirst({
            where: { id: dto.planId, tenantId, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        const subscription = await this.prisma.$transaction(async (tx) => {
            const sub = await tx.subscription.create({
                data: {
                    customerId: dto.customerId,
                    planId: dto.planId,
                    dueDay: dto.dueDay,
                    status: 'ACTIVE',
                },
                include: {
                    customer: true,
                    plan: true,
                },
            });
            const now = new Date();
            let dueDate = new Date(now.getFullYear(), now.getMonth(), dto.dueDay);
            if (dueDate <= now) {
                dueDate.setMonth(dueDate.getMonth() + 1);
            }
            await tx.payment.create({
                data: {
                    subscriptionId: sub.id,
                    customerId: dto.customerId,
                    amount: plan.price,
                    currency: plan.currency,
                    dueDate,
                    status: 'PENDING',
                },
            });
            return sub;
        });
        return subscription;
    }
    async cancel(id, tenantId) {
        const subscription = await this.findOne(id, tenantId);
        if (subscription.status === 'CANCELED') {
            throw new common_1.BadRequestException('Assinatura já está cancelada');
        }
        return this.prisma.subscription.update({
            where: { id },
            data: {
                status: 'CANCELED',
                canceledAt: new Date(),
            },
            include: {
                customer: true,
                plan: true,
            },
        });
    }
    async pause(id, tenantId) {
        const subscription = await this.findOne(id, tenantId);
        if (subscription.status !== 'ACTIVE' && subscription.status !== 'PAST_DUE') {
            throw new common_1.BadRequestException('Assinatura não pode ser pausada');
        }
        return this.prisma.subscription.update({
            where: { id },
            data: { status: 'PAUSED' },
            include: {
                customer: true,
                plan: true,
            },
        });
    }
    async resume(id, tenantId) {
        const subscription = await this.findOne(id, tenantId);
        if (subscription.status !== 'PAUSED' && subscription.status !== 'PAST_DUE') {
            throw new common_1.BadRequestException('Assinatura não pode ser reativada');
        }
        return this.prisma.subscription.update({
            where: { id },
            data: { status: 'ACTIVE' },
            include: {
                customer: true,
                plan: true,
            },
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map