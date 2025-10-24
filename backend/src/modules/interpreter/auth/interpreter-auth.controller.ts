import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Req,
  Res,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { InterpreterAuthService } from './interpreter-auth.service';
import { JwtService } from '@nestjs/jwt';
import { InterpreterAuthGuard, RequestWithInterpreter } from '../../../guards/interpreter-auth.guard';

@Controller('interpreter-auth')
export class InterpreterAuthController {
  constructor(
    private readonly authService: InterpreterAuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    return await this.authService.registerInterpreter(
      body.name,
      body.email,
      body.phone,
      body.password,
      body.languages,
      body.country,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const { interpreter, token } = await this.authService.login(body);

    res.cookie('AccessInterpreterToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { message: 'Login successful', interpreter };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('AccessInterpreterToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(InterpreterAuthGuard)
  async profile(@Req() req: RequestWithInterpreter) {
    return await this.authService.getProfile(req.interpreter.id);
  }

  @Put('edit-profile/:id')
  @UseGuards(InterpreterAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.authService.editProfile(id, body);
  }
}
