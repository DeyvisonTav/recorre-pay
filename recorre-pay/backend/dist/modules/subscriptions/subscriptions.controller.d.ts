import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    findAll(tenantId: string, page?: string, perPage?: string, status?: string, customerId?: string): Promise<{
        data: ({
            customer: {
                name: string;
                email: string;
                phone: string;
                id: string;
                tenantId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                stripeCustomerId: string | null;
                document: string | null;
                notes: string | null;
            };
            plan: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            planId: string;
            stripeSubscriptionId: string | null;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            dueDay: number;
            startDate: Date;
            endDate: Date | null;
            canceledAt: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        customer: {
            name: string;
            email: string;
            phone: string;
            id: string;
            tenantId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            document: string | null;
            notes: string | null;
        };
        plan: {
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
        };
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            customerId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            subscriptionId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            stripePaymentIntentId: string | null;
            stripeInvoiceId: string | null;
            dueDate: Date;
            paidAt: Date | null;
            paymentMethod: string | null;
            paymentLink: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        planId: string;
        stripeSubscriptionId: string | null;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        dueDay: number;
        startDate: Date;
        endDate: Date | null;
        canceledAt: Date | null;
    }>;
    create(tenantId: string, dto: CreateSubscriptionDto): Promise<{
        customer: {
            name: string;
            email: string;
            phone: string;
            id: string;
            tenantId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            document: string | null;
            notes: string | null;
        };
        plan: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        planId: string;
        stripeSubscriptionId: string | null;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        dueDay: number;
        startDate: Date;
        endDate: Date | null;
        canceledAt: Date | null;
    }>;
    cancel(id: string, tenantId: string): Promise<{
        customer: {
            name: string;
            email: string;
            phone: string;
            id: string;
            tenantId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            document: string | null;
            notes: string | null;
        };
        plan: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        planId: string;
        stripeSubscriptionId: string | null;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        dueDay: number;
        startDate: Date;
        endDate: Date | null;
        canceledAt: Date | null;
    }>;
    pause(id: string, tenantId: string): Promise<{
        customer: {
            name: string;
            email: string;
            phone: string;
            id: string;
            tenantId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            document: string | null;
            notes: string | null;
        };
        plan: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        planId: string;
        stripeSubscriptionId: string | null;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        dueDay: number;
        startDate: Date;
        endDate: Date | null;
        canceledAt: Date | null;
    }>;
    resume(id: string, tenantId: string): Promise<{
        customer: {
            name: string;
            email: string;
            phone: string;
            id: string;
            tenantId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            document: string | null;
            notes: string | null;
        };
        plan: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        planId: string;
        stripeSubscriptionId: string | null;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        dueDay: number;
        startDate: Date;
        endDate: Date | null;
        canceledAt: Date | null;
    }>;
}
