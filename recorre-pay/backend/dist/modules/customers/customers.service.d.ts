import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, options?: {
        page?: number;
        perPage?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{
        data: ({
            subscriptions: ({
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
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        subscriptions: ({
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
    } & {
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
    }>;
    create(tenantId: string, dto: CreateCustomerDto): Promise<{
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
    }>;
    update(id: string, tenantId: string, dto: UpdateCustomerDto): Promise<{
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
    }>;
    remove(id: string, tenantId: string): Promise<{
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
    }>;
    getPayments(id: string, tenantId: string): Promise<({
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
    })[]>;
}
