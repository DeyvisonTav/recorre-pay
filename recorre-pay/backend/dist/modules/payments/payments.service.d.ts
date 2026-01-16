import { PrismaService } from '../../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, options?: {
        page?: number;
        perPage?: number;
        status?: string;
        customerId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
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
            subscription: {
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
            };
        } & {
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
        subscription: {
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
        };
    } & {
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
    }>;
    markAsPaid(id: string, tenantId: string): Promise<{
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
        subscription: {
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
        };
    } & {
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
    }>;
    sendReminder(id: string, tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    generateLink(id: string, tenantId: string): Promise<{
        paymentLink: string;
    }>;
}
