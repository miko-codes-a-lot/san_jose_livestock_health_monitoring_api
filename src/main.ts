import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from './_shared/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const frontendUri: string | undefined = configService.get('FRONTEND_URI');
  if (!frontendUri) throw new Error('Env "FRONTEND_URI" is missing');

  app.enableCors({
    // use the * if some problem on CORS occured.
    origin: frontendUri, // *
    credentials: true,
  });

  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
