import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    options: {
      page?: number;
      perPage?: number;
      search?: string;
      isActive?: boolean;
    } = {},
  ) {
    const { page = 1, perPage = 10, search, isActive } = options;
    const skip = (page - 1) * perPage;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            include: { plan: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        subscriptions: {
          include: { plan: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    // Check if email already exists for this tenant
    const existing = await this.prisma.customer.findFirst({
      where: { tenantId, email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    return this.prisma.customer.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id, tenantId);
    const updateData = dto as Partial<CreateCustomerDto> & { isActive?: boolean };

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== customer.email) {
      const existing = await this.prisma.customer.findFirst({
        where: { tenantId, email: updateData.email, id: { not: id } },
      });

      if (existing) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete - just set isActive to false
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getPayments(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.payment.findMany({
      where: { customerId: id },
      orderBy: { dueDate: 'desc' },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });
  }
}
