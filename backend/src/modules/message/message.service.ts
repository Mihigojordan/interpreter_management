import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailService } from 'src/global/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
) {}

  // ✅ Create
async create(data: { content: string; interpreterId: string; requestId: string }) {
  if (!data.content) throw new BadRequestException('Message content required');

  const request = await this.prisma.interpreterRequest.findUnique({
    where: { id: data.requestId },
    include: {
      interpreter: true,
    },
  });

  if (!request) throw new NotFoundException('Request not found');
  if (!request.interpreter) throw new BadRequestException('Request does not have an interpreter assigned');

  const message = await this.prisma.message.create({
    data,
    include: {
      interpreter: true,
      request: true,
    },
  });

  // Email notification to the interpreter
  await this.email.sendEmail(
    request.email,
    'New Message Received',
    'MessageCreated',
    {
      interpreterName: request.fullName,
      requestTitle: 'A client request',
      content: data.content,
      year: new Date().getFullYear(),
    }
  );

  return message;
}


  // ✅ Get all messages
  async findAll() {
    return this.prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        interpreter: true,
        request: true,
      },
    });
  }

  // ✅ Get by ID
  async findOne(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        interpreter: true,
        request: true,
      },
    });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  // ✅ Update (content only)
  async update(id: string, data: { content?: string }) {
    const message = await this.findOne(id);
    return this.prisma.message.update({
      where: { id: message.id },
      data,
    });
  }

  // ✅ Delete
  async remove(id: string) {
    const message = await this.findOne(id);
    return this.prisma.message.delete({ where: { id: message.id } });
  }

  // ✅ Get messages by Request
  async findByRequest(requestId: string) {
    return this.prisma.message.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
      include: {
        interpreter: true,
      },
    });
  }
}
