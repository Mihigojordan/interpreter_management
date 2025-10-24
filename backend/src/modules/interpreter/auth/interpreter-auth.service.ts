import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InterpreterAuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Register a new interpreter
  async registerInterpreter(
    name: string,
    email: string,
    phone: string,
    password: string,
    languages: string[],
    country: string,
  ) {
    if (!email || !password || !name || !phone || !languages || !country)
      throw new BadRequestException('All required fields must be filled');

    if (!this.emailRegex.test(email))
      throw new BadRequestException('Invalid email address');

    if (password.length < 6)
      throw new BadRequestException('Password too short');

    const exists = await this.prisma.interpreter.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('Interpreter already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const interpreter = await this.prisma.interpreter.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        languages: JSON.stringify(languages),
        country,
      },
    });

    return { message: 'Interpreter registered successfully', interpreter };
  }

  // Login interpreter
async login({ email, password }: { email: string; password: string }) {
  const interpreter = await this.prisma.interpreter.findUnique({
    where: { email },
  });

  if (!interpreter) {
    throw new UnauthorizedException('Interpreter not found');
  }

  // Status checks
  if (interpreter.status === 'PENDING') {
    throw new UnauthorizedException('Your account is pending approval');
  }

  if (interpreter.status === 'REJECTED') {
    throw new UnauthorizedException(
      `Your account has been rejected. Reason: ${interpreter.reason || 'Not specified'}`
    );
  }

  // Password validation
  if (!interpreter.password) {
    throw new UnauthorizedException('Password not set. Contact support.');
  }

  const valid = await bcrypt.compare(password, interpreter.password);
  if (!valid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const token = this.jwtService.sign(
    { id: interpreter.id, email: interpreter.email, name: interpreter.name },
    {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    }
  );

  return {
    message: 'Login successful',
    interpreter: {
      id: interpreter.id,
      name: interpreter.name,
      email: interpreter.email,
      status: interpreter.status,
      isOnline: interpreter.isOnline,
    },
    token,
  };
}

  // Get profile
  async getProfile(interpreterId: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { id: interpreterId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photoUrl: true,
        languages: true,
        country: true,
        status: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!interpreter) throw new NotFoundException('Interpreter not found');
    return interpreter;
  }

  // Update profile
  async editProfile(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      photoUrl: string;
      languages: string[];
      country: string;
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
      isOnline: boolean;
    }>,
  ) {
    const interpreter = await this.prisma.interpreter.findUnique({ where: { id } });
    if (!interpreter) throw new NotFoundException('Interpreter not found');

    // Check for duplicate email
    if (data.email && data.email !== interpreter.email) {
      const exists = await this.prisma.interpreter.findUnique({ where: { email: data.email } });
      if (exists) throw new BadRequestException('Email already exists');
    }

    const updatedInterpreter = await this.prisma.interpreter.update({
      where: { id },
      data: {
        name: data.name ?? interpreter.name,
        email: data.email ?? interpreter.email,
        phone: data.phone ?? interpreter.phone,
        photoUrl: data.photoUrl ?? interpreter.photoUrl,
        languages: data.languages ? JSON.stringify(data.languages) : JSON.stringify(interpreter.languages),
        country: data.country ?? interpreter.country,
        status: data.status ?? interpreter.status,
        isOnline: data.isOnline ?? interpreter.isOnline,
      },
    });

    return updatedInterpreter;
  }

  // ✅ Accept interpreter
  async acceptInterpreter(id: string) {
    const interpreter = await this.prisma.interpreter.findUnique({ where: { id } });
    if (!interpreter) throw new NotFoundException('Interpreter not found');
    if (interpreter.status === 'ACCEPTED') throw new BadRequestException('Interpreter is already accepted');

    const updated = await this.prisma.interpreter.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    return updated;
  }

  // ✅ Reject interpreter
  async rejectInterpreter(id: string) {
    const interpreter = await this.prisma.interpreter.findUnique({ where: { id } });
    if (!interpreter) throw new NotFoundException('Interpreter not found');
    if (interpreter.status === 'REJECTED') throw new BadRequestException('Interpreter is already rejected');

    const updated = await this.prisma.interpreter.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return updated;
  }
}
