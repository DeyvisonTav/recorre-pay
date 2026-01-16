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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, options = {}) {
        const { page = 1, perPage = 10, status, customerId, startDate, endDate } = options;
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
        if (startDate || endDate) {
            where.dueDate = {};
            if (startDate) {
                where.dueDate.gte = new Date(startDate);
            }
            if (endDate) {
                where.dueDate.lte = new Date(endDate);
            }
        }
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { dueDate: 'desc' },
                include: {
                    customer: true,
                    subscription: {
                        include: { plan: true },
                    },
                },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            data: payments,
            meta: {
                total,
                page,
                perPage,
                totalPages: Math.ceil(total / perPage),
            },
        };
    }
    async findOne(id, tenantId) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id,
                customer: { tenantId },
            },
            include: {
                customer: true,
                subscription: {
                    include: { plan: true },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        return payment;
    }
    async markAsPaid(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.payment.update({
            where: { id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                paymentMethod: 'manual',
            },
            include: {
                customer: true,
                subscription: {
                    include: { plan: true },
                },
            },
        });
    }
    async sendReminder(id, tenantId) {
        const payment = await this.findOne(id, tenantId);
        await this.prisma.notification.create({
            data: {
                type: 'PAYMENT_REMINDER',
                channel: 'EMAIL',
                recipient: payment.customer.email,
                subject: 'Lembrete de Pagamento',
                message: `Olá ${payment.customer.name}, sua mensalidade de R$ ${payment.amount} vence em breve.`,
                paymentId: id,
                status: 'PENDING',
            },
        });
        return { success: true, message: 'Lembrete enviado' };
    }
    async generateLink(id, tenantId) {
        const payment = await this.findOne(id, tenantId);
        const paymentLink = `https://pay.recorrepay.com/${payment.id}`;
        await this.prisma.payment.update({
            where: { id },
            data: { paymentLink },
        });
        return { paymentLink };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map