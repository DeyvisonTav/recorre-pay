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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const slug = dto.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        let finalSlug = slug;
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { slug },
        });
        if (existingTenant) {
            finalSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.businessName,
                    slug: finalSlug,
                    email: dto.email,
                    phone: dto.phone,
                },
            });
            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    name: dto.name,
                    email: dto.email,
                    password: hashedPassword,
                    role: 'OWNER',
                },
            });
            return { tenant, user };
        });
        const token = this.generateToken(result.user, result.tenant.id);
        return {
            accessToken: token,
            user: {
                id: result.user.id,
                tenantId: result.tenant.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
                isActive: result.user.isActive,
                createdAt: result.user.createdAt.toISOString(),
            },
            tenant: {
                id: result.tenant.id,
                name: result.tenant.name,
                slug: result.tenant.slug,
                email: result.tenant.email,
                phone: result.tenant.phone,
                defaultDueDay: result.tenant.defaultDueDay,
                reminderDaysBefore: result.tenant.reminderDaysBefore,
                createdAt: result.tenant.createdAt.toISOString(),
            },
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email },
            include: { tenant: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Usuário desativado');
        }
        const token = this.generateToken(user, user.tenantId);
        return {
            accessToken: token,
            user: {
                id: user.id,
                tenantId: user.tenantId,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(),
            },
            tenant: {
                id: user.tenant.id,
                name: user.tenant.name,
                slug: user.tenant.slug,
                email: user.tenant.email,
                phone: user.tenant.phone,
                defaultDueDay: user.tenant.defaultDueDay,
                reminderDaysBefore: user.tenant.reminderDaysBefore,
                createdAt: user.tenant.createdAt.toISOString(),
            },
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado');
        }
        return {
            id: user.id,
            tenantId: user.tenantId,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
        };
    }
    generateToken(user, tenantId) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map