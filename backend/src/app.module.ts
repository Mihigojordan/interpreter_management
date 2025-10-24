import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './modules/admin-management/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './global/email/email.module';
import { ExpenseModule } from './modules/expense-managment/expense.module';
import { ReportModule } from './modules/report-management/report.module';
import { DriveModule } from './global/googleDriveService/driver.module';
import { InterpreterModule } from './modules/interpreter/interpreter.module';

@Module({
  imports: [
    EmailModule,
    AdminModule,
    PrismaModule,
    ExpenseModule,
    ReportModule,
    DriveModule,
    InterpreterModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
