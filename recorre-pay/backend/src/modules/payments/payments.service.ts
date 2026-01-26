import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async findAll(
    tenantId: string,
    options: {
      page?: number;
      perPage?: number;
      status?: string;
      customerId?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ) {
    const { page = 1, perPage = 10, status, customerId, startDate, endDate } = options;
    const skip = (page - 1) * perPage;

    const where: any = {
      customer: { tenantId },
    };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) {
        where.dueDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.dueDate.lte = new Date(endDate);
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { dueDate: 'desc' },
        include: {
          customer: true,
          subscription: {
            include: { plan: true },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }

  async markAsPaid(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod: 'manual',
      },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
      },
    });
  }

  async sendReminder(id: string, tenantId: string) {
    const payment = await this.findOne(id, tenantId);

    // Create notification record
    await this.prisma.notification.create({
      data: {
        type: 'PAYMENT_REMINDER',
        channel: 'EMAIL',
        recipient: payment.customer.email,
        subject: 'Lembrete de Pagamento',
        message: `Olá ${payment.customer.name}, sua mensalidade de R$ ${payment.amount} vence em breve.`,
        paymentId: id,
        status: 'PENDING',
      },
    });

    // TODO: Actually send the notification (email/whatsapp)

    return { success: true, message: 'Lembrete enviado' };
  }

  async generateLink(id: string, tenantId: string) {
    // Verify payment exists and belongs to tenant
    await this.findOne(id, tenantId);

    try {
      // Generate Stripe Checkout link
      const paymentLink = await this.stripeService.createPaymentLink(id);
      return { paymentLink };
    } catch (error) {
      // Fallback to simple link if Stripe is not configured
      const paymentLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${id}`;

      await this.prisma.payment.update({
        where: { id },
        data: { paymentLink },
      });

      return { paymentLink };
    }
  }
}
