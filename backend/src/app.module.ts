import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './modules/admin-management/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './global/email/email.module';

import { DriveModule } from './global/googleDriveService/driver.module';
import { InterpreterRequestsModule } from './modules/interepeter-request/interpreter-requests.module';
import { InterpreterModule } from './modules/interpreter/interpreter.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [
    EmailModule,
    AdminModule,
    PrismaModule,
    DriveModule,
    InterpreterRequestsModule,
    
    InterpreterModule,
    MessageModule,  
  ],
  controllers: [AppController],
})
export class AppModule {}
