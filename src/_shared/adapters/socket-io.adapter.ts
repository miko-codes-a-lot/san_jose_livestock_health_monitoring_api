import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    private readonly app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const frontendUri = this.configService.get<string>('FRONTEND_URI');

    console.log('Configuring WebSocket CORS for origin:', frontendUri);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: frontendUri,
        credentials: true,
      },
    });
  }
}
