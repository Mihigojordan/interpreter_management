import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';

import { EmailModule } from 'src/global/email/email.module';

import { GoogleAdminStrategy } from './google.strategy';

@Module({
  controllers: [AdminController,],
  providers: [AdminService,GoogleAdminStrategy],
  imports: [
    JwtModule.register({
      secret: process.env.Jwt_SECRET_KEY,
      global: true,
      signOptions: {
        expiresIn: "7d"
      }
    }),
    EmailModule,
  ]
})
export class AdminModule {}
