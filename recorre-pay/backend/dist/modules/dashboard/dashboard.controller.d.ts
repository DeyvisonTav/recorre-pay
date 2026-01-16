import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(tenantId: string): Promise<{
        totalExpected: number;
        totalReceived: number;
        totalOverdue: number;
        activeCustomers: number;
        activeSubscriptions: number;
    }>;
    getOverdue(tenantId: string): Promise<{
        id: string;
        customer: {
            name: string;
            phone: string;
            id: string;
        };
        amount: number;
        dueDate: string;
        daysOverdue: number;
    }[]>;
    getUpcoming(tenantId: string): Promise<{
        id: string;
        customer: {
            name: string;
            id: string;
        };
        amount: number;
        dueDate: string;
        daysUntilDue: number;
    }[]>;
}
