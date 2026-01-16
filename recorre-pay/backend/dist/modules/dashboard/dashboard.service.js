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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(tenantId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const payments = await this.prisma.payment.findMany({
            where: {
                customer: { tenantId },
                dueDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });
        const totalExpected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalReceived = payments
            .filter((p) => p.status === 'PAID')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalOverdue = payments
            .filter((p) => p.status === 'OVERDUE')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const [activeCustomers, activeSubscriptions] = await Promise.all([
            this.prisma.customer.count({
                where: { tenantId, isActive: true },
            }),
            this.prisma.subscription.count({
                where: {
                    customer: { tenantId },
                    status: 'ACTIVE',
                },
            }),
        ]);
        return {
            totalExpected,
            totalReceived,
            totalOverdue,
            activeCustomers,
            activeSubscriptions,
        };
    }
    async getOverdue(tenantId) {
        const now = new Date();
        const overduePayments = await this.prisma.payment.findMany({
            where: {
                customer: { tenantId },
                status: 'OVERDUE',
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
            take: 20,
        });
        return overduePayments.map((payment) => ({
            id: payment.id,
            customer: payment.customer,
            amount: Number(payment.amount),
            dueDate: payment.dueDate.toISOString(),
            daysOverdue: Math.floor((now.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        }));
    }
    async getUpcoming(tenantId) {
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingPayments = await this.prisma.payment.findMany({
            where: {
                customer: { tenantId },
                status: 'PENDING',
                dueDate: {
                    gte: now,
                    lte: in7Days,
                },
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
            take: 20,
        });
        return upcomingPayments.map((payment) => ({
            id: payment.id,
            customer: payment.customer,
            amount: Number(payment.amount),
            dueDate: payment.dueDate.toISOString(),
            daysUntilDue: Math.ceil((payment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map