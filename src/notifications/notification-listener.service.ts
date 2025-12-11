import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  Schedule,
  ScheduleDocument,
  ScheduleStatus,
} from 'src/schedule/entities/schedule.entity';

@Injectable()
export class NotificationListenerService implements OnModuleInit {
  private readonly logger = new Logger(NotificationListenerService.name);

  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
    private readonly notificationService: NotificationsService,
  ) {}

  onModuleInit() {
    this.watchScheduleChanges();
  }

  private watchScheduleChanges() {
    this.scheduleModel.collection
      .watch<ScheduleDocument>()
      .on('change', (change) => {
        const handle = async () => {
          try {
            switch (change.operationType) {
              case 'insert':
                await this.handleScheduleCreation(change.fullDocument);
                break;
              case 'update':
                // Only trigger if status is actually modified
                if (change.updateDescription.updatedFields?.status) {
                  const updatedSchedule = await this.scheduleModel
                    .findById(change.documentKey._id)
                    .populate([
                      { path: 'farmer' },
                      { path: 'assignedVet' },
                      { path: 'createdBy' },
                      { path: 'animal' },
                    ]);

                  if (updatedSchedule) {
                    await this.handleScheduleStatusUpdate(updatedSchedule);
                  }
                }
                break;
            }
          } catch (error) {
            this.logger.error('Error processing stream event:', error);
          }
        };

        handle()
          .then(() => this.logger.log('Schedule listen event processed'))
          .catch((e) => this.logger.error(e));
      });
  }

  private async handleScheduleCreation(scheduleDoc: ScheduleDocument) {
    this.logger.log(`New schedule created: ${scheduleDoc._id.toString()}`);

    // We must populate manually because fullDocument from watch is raw BSON
    const schedule = await this.scheduleModel
      .findById(scheduleDoc._id)
      .populate('farmer assignedVet createdBy animal');

    if (!schedule) return;

    // Helper to format names safely
    const techName = `${schedule.createdBy['firstName']} ${schedule.createdBy['lastName']}`;
    // const vetName = `${schedule.assignedVet['firstName']} ${schedule.assignedVet['lastName']}`;
    const animalName = schedule.animal.tagNumber;

    const notifications: CreateNotificationDto[] = [];

    // 1. Notify Veterinarian
    // "Technician created a schedule for you"
    notifications.push({
      recipient: schedule.assignedVet._id.toString(),
      message: `Technician ${techName} assigned a new ${schedule.type} schedule to you.`,
      type: NotificationType.SCHEDULE_CREATED,
      // Vets usually have an admin/staff view
      link: `/schedule/details/${schedule._id.toString()}`,
    });

    // 2. Notify Farmer
    // "A schedule was created for your livestock"
    notifications.push({
      recipient: schedule.farmer._id.toString(),
      message: `A ${schedule.type} visit for ${animalName} has been scheduled. Waiting for Vet approval.`,
      type: NotificationType.SCHEDULE_CREATED,
      // Farmers usually have a client/app view
      link: `/schedule/schedule/${schedule._id.toString()}`,
    });

    // Note: We usually don't notify the Technician (createdBy) because they triggered it.

    if (notifications.length > 0) {
      await this.notificationService.createMany(notifications);
    }
  }

  private async handleScheduleStatusUpdate(schedule: ScheduleDocument) {
    const notifications: CreateNotificationDto[] = [];

    const vetName = `${schedule.assignedVet['firstName']} ${schedule.assignedVet['lastName']}`;
    const animalName = schedule.animal.tagNumber;

    // Different messages based on status
    if (schedule.status === ScheduleStatus.APPROVED) {
      // Notify Technician: "Vet accepted the schedule"
      notifications.push({
        recipient: schedule.createdBy._id.toString(),
        message: `Dr. ${vetName} APPROVED the ${schedule.type} schedule for ${animalName}.`,
        type: NotificationType.SCHEDULE_STATUS_UPDATED,
        link: `/schedule/details/${schedule._id.toString()}`,
      });

      // Notify Farmer: "Schedule confirmed"
      notifications.push({
        recipient: schedule.farmer._id.toString(),
        message: `The ${schedule.type} visit for ${animalName} has been CONFIRMED by Dr. ${vetName}.`,
        type: NotificationType.SCHEDULE_STATUS_UPDATED,
        link: `/schedule/schedule/${schedule._id.toString()}`,
      });
    } else if (schedule.status === ScheduleStatus.DECLINED) {
      // Notify Technician: "Vet rejected the schedule"
      notifications.push({
        recipient: schedule.createdBy._id.toString(),
        message: `Dr. ${vetName} DECLINED the ${schedule.type} schedule for ${animalName}. Please reschedule.`,
        type: NotificationType.SCHEDULE_STATUS_UPDATED,
        link: `/schedule/details/${schedule._id.toString()}`,
      });

      // Notify Farmer: "Schedule rejected/cancelled"
      notifications.push({
        recipient: schedule.farmer._id.toString(),
        message: `The ${schedule.type} visit for ${animalName} was declined. Your technician will update you shortly.`,
        type: NotificationType.SCHEDULE_STATUS_UPDATED,
        link: `/schedule/schedule/${schedule._id.toString()}`,
      });
    }

    if (notifications.length > 0) {
      await this.notificationService.createMany(notifications);
    }
  }
}
