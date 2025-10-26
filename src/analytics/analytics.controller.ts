import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UserSession } from 'src/_shared/decorators/user-session.decorator';
import { UserSessionDto } from 'src/_shared/dto/user-session.dto';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getData(@UserSession() user: UserSessionDto) {
    if (user.role === 'farmer') {
      return this.analyticsService.getFarmerData(user.sub);
    }
    return this.analyticsService.getAdminData(user.sub);
  }
}
