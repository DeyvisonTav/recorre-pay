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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, options = {}) {
        const { page = 1, perPage = 10, search, isActive } = options;
        const skip = (page - 1) * perPage;
        const where = { tenantId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    subscriptions: {
                        include: { plan: true },
                    },
                },
            }),
            this.prisma.customer.count({ where }),
        ]);
        return {
            data: customers,
            meta: {
                total,
                page,
                perPage,
                totalPages: Math.ceil(total / perPage),
            },
        };
    }
    async findOne(id, tenantId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
            include: {
                subscriptions: {
                    include: { plan: true },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Cliente não encontrado');
        }
        return customer;
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.customer.findFirst({
            where: { tenantId, email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        return this.prisma.customer.create({
            data: {
                tenantId,
                ...dto,
            },
        });
    }
    async update(id, tenantId, dto) {
        const customer = await this.findOne(id, tenantId);
        const updateData = dto;
        if (updateData.email && updateData.email !== customer.email) {
            const existing = await this.prisma.customer.findFirst({
                where: { tenantId, email: updateData.email, id: { not: id } },
            });
            if (existing) {
                throw new common_1.ConflictException('Email já cadastrado');
            }
        }
        return this.prisma.customer.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.customer.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async getPayments(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.payment.findMany({
            where: { customerId: id },
            orderBy: { dueDate: 'desc' },
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map