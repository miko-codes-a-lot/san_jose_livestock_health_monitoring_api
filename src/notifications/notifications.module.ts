import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationListenerService } from './notification-listener.service';
import { RtNotificationsGateway } from './rt-notifications.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './entities/notification.entity';
import {
  Schedule,
  ScheduleSchema,
} from 'src/schedule/entities/schedule.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationListenerService,
    RtNotificationsGateway,
  ],
})
export class NotificationsModule {}
