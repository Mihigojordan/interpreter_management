import { Module } from '@nestjs/common';
import { InterpreterRequestsService } from './interpreter-requests.service';
import { InterpreterRequestsController } from './interpreter-requests.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../global/email/email.service';

@Module({
  controllers: [InterpreterRequestsController],
  providers: [InterpreterRequestsService, PrismaService, EmailService],
})
export class InterpreterRequestsModule {}