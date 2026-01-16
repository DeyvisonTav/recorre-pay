import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    options: {
      page?: number;
      perPage?: number;
      status?: string;
      customerId?: string;
    } = {},
  ) {
    const { page = 1, perPage = 10, status, customerId } = options;
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

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          plan: true,
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
      include: {
        customer: true,
        plan: true,
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    return subscription;
  }

  async create(tenantId: string, dto: CreateSubscriptionDto) {
    // Verify customer belongs to tenant
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Verify plan belongs to tenant and is active
    const plan = await this.prisma.plan.findFirst({
      where: { id: dto.planId, tenantId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Create subscription and first payment
    const subscription = await this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          customerId: dto.customerId,
          planId: dto.planId,
          dueDay: dto.dueDay,
          status: 'ACTIVE',
        },
        include: {
          customer: true,
          plan: true,
        },
      });

      // Calculate first payment due date
      const now = new Date();
      let dueDate = new Date(now.getFullYear(), now.getMonth(), dto.dueDay);
      if (dueDate <= now) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      // Create first payment
      await tx.payment.create({
        data: {
          subscriptionId: sub.id,
          customerId: dto.customerId,
          amount: plan.price,
          currency: plan.currency,
          dueDate,
          status: 'PENDING',
        },
      });

      return sub;
    });

    return subscription;
  }

  async cancel(id: string, tenantId: string) {
    const subscription = await this.findOne(id, tenantId);

    if (subscription.status === 'CANCELED') {
      throw new BadRequestException('Assinatura já está cancelada');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
      include: {
        customer: true,
        plan: true,
      },
    });
  }

  async pause(id: string, tenantId: string) {
    const subscription = await this.findOne(id, tenantId);

    if (subscription.status !== 'ACTIVE' && subscription.status !== 'PAST_DUE') {
      throw new BadRequestException('Assinatura não pode ser pausada');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'PAUSED' },
      include: {
        customer: true,
        plan: true,
      },
    });
  }

  async resume(id: string, tenantId: string) {
    const subscription = await this.findOne(id, tenantId);

    if (subscription.status !== 'PAUSED' && subscription.status !== 'PAST_DUE') {
      throw new BadRequestException('Assinatura não pode ser reativada');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        customer: true,
        plan: true,
      },
    });
  }
}
