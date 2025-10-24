import { Module } from '@nestjs/common';
import { InterpreterAuthController } from './interpreter-auth.controller';
import { InterpreterAuthService } from './interpreter-auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.Jwt_SECRET_KEY,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [InterpreterAuthController],
  providers: [InterpreterAuthService, PrismaService],
})
export class InterpreterAuthModule {}
