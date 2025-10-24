import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface RequestWithInterpreter extends Request {
  interpreter?: any;
}

@Injectable()
export class InterpreterAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithInterpreter>();
    const token = req.cookies?.['AccessInterpreterToken'];
    if (!token) throw new UnauthorizedException('Authentication token missing');

    try {
      const decoded = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      req.interpreter = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
