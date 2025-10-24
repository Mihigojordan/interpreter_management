import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { EmailService } from 'src/global/email/email.service';
import { last } from 'rxjs';

@Injectable()
export class InterpreterService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  // 🔐 Generate random plain password
  private generatePassword(length = 10): string {
    return randomBytes(length).toString('base64').slice(0, length);
  }

  // 🔒 Hash password using bcrypt
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // ✅ Validate interpreter data
  private validateInterpreterData(data: any) {
    if (!data.name || typeof data.name !== 'string') {
      throw new BadRequestException('Name is required and must be a string');
    }
    if (!data.email || typeof data.email !== 'string') {
      throw new BadRequestException('Email is required');
    }
    if (!data.phone || typeof data.phone !== 'string') {
      throw new BadRequestException('Phone number is required');
    }
    if (!Array.isArray(data.languages) || data.languages.length === 0) {
      throw new BadRequestException('Languages must be a non-empty array');
    }
    if (!data.country || typeof data.country !== 'string') {
      throw new BadRequestException('Country is required');
    }
    if (data.photoUrl && typeof data.photoUrl !== 'string') {
      throw new BadRequestException('Photo must be a valid string URL');
    }
    return data;
  }

  // ✅ Create interpreter
  async create(data: any) {
    this.validateInterpreterData(data);

    // Generate & hash password
    const plainPassword = this.generatePassword();
    const hashedPassword = await this.hashPassword(plainPassword);

    // Check for duplicate email
    if (data.email) {
      const exists = await this.prisma.interpreter.findUnique({ where: { email: data.email } });
      if (exists) throw new BadRequestException('Email already exists');

      // Send email with generated password
      await this.email.sendEmail(
        data.email,
        'Your Interpreter Account Created',
        'Welcome-User-notification',
        {
          firstName: data.name ? data.name.split(' ')[0] : '',
          lastName: data.name ? last.call(data.name.split(' ')) : '',
          email: data.email,
          loginUrl: `${process.env.FRONTEND_URL}/auth/interpreter/login`,
          password: plainPassword,
          year: new Date().getFullYear(),
        },
      );
    }

    data.password = hashedPassword;
    return this.prisma.interpreter.create({ data });
  }

  // ✅ Find all interpreters
  findAll() {
    return this.prisma.interpreter.findMany();
  }

  // ✅ Find interpreter by UUID
  async findOne(id: string) {
    const interpreter = await this.prisma.interpreter.findUnique({ where: { id } });
    if (!interpreter) throw new NotFoundException('Interpreter not found');
    return interpreter;
  }

  // ✅ Update interpreter
  async update(id: string, data: any) {
    this.validateInterpreterData(data);

    const interpreter = await this.prisma.interpreter.findUnique({ where: { id } });
    if (!interpreter) throw new NotFoundException('Interpreter not found');

    return this.prisma.interpreter.update({ where: { id }, data });
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

    // // Optionally send email
    // await this.email.sendEmail(
    //   updated.email,
    //   'Your account has been approved',
    //   'InterpreterApproval',
    //   { firstName: updated.name.split(' ')[0], status: 'ACCEPTED' },
    // );

    return updated;
  }

// ✅ Reject interpreter with reason
async rejectInterpreter(id: string, reason: string) {
  const interpreter = await this.prisma.interpreter.findUnique({ where: { id } });
  if (!interpreter) throw new NotFoundException('Interpreter not found');
  if (interpreter.status === 'REJECTED') throw new BadRequestException('Interpreter is already rejected');

  const updated = await this.prisma.interpreter.update({
    where: { id },
    data: { status: 'REJECTED', reason },
  });

  // Send rejection email with reason
  await this.email.sendEmail(
    updated.email,
    'Your account has been rejected',
    'InterpreterRejection',
    {
      firstName: updated.name.split(' ')[0],
      status: 'REJECTED',
      reason,
    },
  );

  return updated;
}

  // ✅ Delete interpreter
  async remove(id: string) {
    const interpreter = await this.prisma.interpreter.findUnique({ where: { id } });
    if (!interpreter) throw new NotFoundException('Interpreter not found');
    return this.prisma.interpreter.delete({ where: { id } });
  }
}
