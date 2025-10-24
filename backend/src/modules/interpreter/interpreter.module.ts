import { Module } from '@nestjs/common';
import { InterpreterService } from './interpreter.service';
import { InterpreterController } from './interpreter.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { InterpreterAuthModule } from './auth/interpreter-auth.module';

@Module({
  controllers: [InterpreterController],
  imports: [InterpreterAuthModule],
  providers: [InterpreterService, PrismaService]
})
export class InterpreterModule {}
