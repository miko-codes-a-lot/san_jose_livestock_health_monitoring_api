import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserSession } from 'src/_shared/decorators/user-session.decorator';
import { UserSessionDto } from 'src/_shared/dto/user-session.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@UserSession() user: UserSessionDto) {
    return this.notificationsService.findAllForUser(user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @UserSession() user: UserSessionDto) {
    return this.notificationsService.markAsRead(id, user.sub);
  }
}
