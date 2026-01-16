import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlansController {
    private plansService;
    constructor(plansService: PlansService);
    findAll(tenantId: string): Promise<({
        _count: {
            subscriptions: number;
        };
    } & {
        name: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        interval: import(".prisma/client").$Enums.BillingInterval;
        intervalCount: number;
        stripePriceId: string | null;
        stripeProductId: string | null;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        _count: {
            subscriptions: number;
        };
    } & {
        name: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        interval: import(".prisma/client").$Enums.BillingInterval;
        intervalCount: number;
        stripePriceId: string | null;
        stripeProductId: string | null;
    }>;
    create(tenantId: string, dto: CreatePlanDto): Promise<{
        name: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        interval: import(".prisma/client").$Enums.BillingInterval;
        intervalCount: number;
        stripePriceId: string | null;
        stripeProductId: string | null;
    }>;
    update(id: string, tenantId: string, dto: UpdatePlanDto): Promise<{
        name: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        interval: import(".prisma/client").$Enums.BillingInterval;
        intervalCount: number;
        stripePriceId: string | null;
        stripeProductId: string | null;
    }>;
    remove(id: string, tenantId: string): Promise<{
        name: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        interval: import(".prisma/client").$Enums.BillingInterval;
        intervalCount: number;
        stripePriceId: string | null;
        stripeProductId: string | null;
    }>;
}
