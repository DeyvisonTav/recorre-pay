import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.subscriptionsService.findAll(tenantId, {
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 10,
      status,
      customerId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.subscriptionsService.findOne(id, tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(tenantId, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.subscriptionsService.cancel(id, tenantId);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.subscriptionsService.pause(id, tenantId);
  }

  @Post(':id/resume')
  resume(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.subscriptionsService.resume(id, tenantId);
  }
}
