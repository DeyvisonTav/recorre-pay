import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getMe(user: CurrentUserData): Promise<{
        id: string;
        tenantId: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: string;
    }>;
}
