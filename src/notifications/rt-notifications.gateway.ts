import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { Notification } from './entities/notification.entity';
import * as cookie from 'cookie';

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: '*' },
})
export class RtNotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RtNotificationsGateway.name);

  private connectedUsers: Map<string, Set<string>> = new Map();

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies.jwt; // or however you store the token

      // Fallback: check auth header if cookie missing (common in mobile apps)
      const finalToken =
        token || client.handshake.headers.authorization?.split(' ')[1];

      if (!finalToken) {
        throw new Error('Authentication token not found.');
      }

      const payload = (await this.authService.verifyJwt(
        finalToken,
      )) as unknown as {
        sub: string;
      };
      const userId = payload.sub;

      // Add socket ID to the user's Set
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      const connectedUser = this.connectedUsers.get(userId);
      if (connectedUser) {
        connectedUser.add(client.id);
      }

      this.logger.log(`Client connected: ${client.id}, UserID: ${userId}`);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Iterate to find and remove the specific socket ID
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
        break;
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @WebSocketServer()
  server: Server;

  @OnEvent('notification.created')
  handleNotificationCreated(notification: Notification) {
    this.sendNotificationToUser(
      notification.recipient._id.toString(), // Ensure string
      notification,
    );
  }

  @OnEvent('notifications.created')
  handleNotificationsCreated(notifications: Notification[]) {
    notifications.forEach((notification) => {
      this.sendNotificationToUser(
        notification.recipient._id.toString(),
        notification,
      );
    });
  }

  private sendNotificationToUser(userId: string, payload: Notification) {
    const sockets = this.connectedUsers.get(userId);

    if (sockets && sockets.size > 0) {
      // Emit to all sockets belonging to this user
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('new_notification', payload);
      });
      this.logger.log(
        `Sent notification to user ${userId} on ${sockets.size} device(s)`,
      );
    }
  }
}
