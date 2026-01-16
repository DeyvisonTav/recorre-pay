import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all payments for this month
    const payments = await this.prisma.payment.findMany({
      where: {
        customer: { tenantId },
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate totals
    const totalExpected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalReceived = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalOverdue = payments
      .filter((p) => p.status === 'OVERDUE')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Count active customers and subscriptions
    const [activeCustomers, activeSubscriptions] = await Promise.all([
      this.prisma.customer.count({
        where: { tenantId, isActive: true },
      }),
      this.prisma.subscription.count({
        where: {
          customer: { tenantId },
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      totalExpected,
      totalReceived,
      totalOverdue,
      activeCustomers,
      activeSubscriptions,
    };
  }

  async getOverdue(tenantId: string) {
    const now = new Date();

    const overduePayments = await this.prisma.payment.findMany({
      where: {
        customer: { tenantId },
        status: 'OVERDUE',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });

    return overduePayments.map((payment) => ({
      id: payment.id,
      customer: payment.customer,
      amount: Number(payment.amount),
      dueDate: payment.dueDate.toISOString(),
      daysOverdue: Math.floor(
        (now.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  async getUpcoming(tenantId: string) {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingPayments = await this.prisma.payment.findMany({
      where: {
        customer: { tenantId },
        status: 'PENDING',
        dueDate: {
          gte: now,
          lte: in7Days,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });

    return upcomingPayments.map((payment) => ({
      id: payment.id,
      customer: payment.customer,
      amount: Number(payment.amount),
      dueDate: payment.dueDate.toISOString(),
      daysUntilDue: Math.ceil(
        (payment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }
}
