import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports:[JwtModule.register({})],
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
})
export class MessageModule {}
