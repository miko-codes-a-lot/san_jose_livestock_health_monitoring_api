import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserSessionDto } from '../dto/user-session.dto';

export const UserSession = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    if (!request['user'])
      throw new UnauthorizedException('User not found in request');

    return request['user'] as UserSessionDto;
  },
);
