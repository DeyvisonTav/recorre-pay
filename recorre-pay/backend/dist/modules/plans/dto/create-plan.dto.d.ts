export declare class CreatePlanDto {
    name: string;
    description?: string;
    price: number;
    interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    intervalCount?: number;
}
