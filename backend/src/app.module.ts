import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './modules/admin-management/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './global/email/email.module';

import { DriveModule } from './global/googleDriveService/driver.module';
import { InterpreterRequestsModule } from './modules/interepeter-request/interpreter-requests.module';

@Module({
  imports: [
    AdminModule,
    PrismaModule,
    DriveModule,
    InterpreterRequestsModule
    
  ],
  controllers: [AppController],
})
export class AppModule {}
