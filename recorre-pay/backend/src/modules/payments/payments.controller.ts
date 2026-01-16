import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.findAll(tenantId, {
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 10,
      status,
      customerId,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsService.findOne(id, tenantId);
  }

  @Post(':id/mark-paid')
  markAsPaid(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsService.markAsPaid(id, tenantId);
  }

  @Post(':id/send-reminder')
  sendReminder(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsService.sendReminder(id, tenantId);
  }

  @Post(':id/generate-link')
  generateLink(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsService.generateLink(id, tenantId);
  }
}
