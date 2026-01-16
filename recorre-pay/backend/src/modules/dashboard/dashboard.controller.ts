import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getSummary(tenantId);
  }

  @Get('overdue')
  getOverdue(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getOverdue(tenantId);
  }

  @Get('upcoming')
  getUpcoming(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getUpcoming(tenantId);
  }
}
