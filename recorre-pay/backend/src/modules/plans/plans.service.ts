import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.plan.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plan;
  }

  async create(tenantId: string, dto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        interval: dto.interval,
        intervalCount: dto.intervalCount || 1,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdatePlanDto) {
    await this.findOne(id, tenantId);

    return this.prisma.plan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete - just set isActive to false
    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
