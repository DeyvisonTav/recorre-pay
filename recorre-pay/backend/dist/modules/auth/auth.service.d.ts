import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            tenantId: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: string;
        };
        tenant: {
            id: string;
            name: string;
            slug: string;
            email: string;
            phone: string | null;
            defaultDueDay: number;
            reminderDaysBefore: number;
            createdAt: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            tenantId: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: true;
            createdAt: string;
        };
        tenant: {
            id: string;
            name: string;
            slug: string;
            email: string;
            phone: string | null;
            defaultDueDay: number;
            reminderDaysBefore: number;
            createdAt: string;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: string;
    }>;
    private generateToken;
}
