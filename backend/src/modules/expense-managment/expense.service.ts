import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, adminId: string) {
    try {
      const expense = await this.prisma.expense.create({
        data: {
          ...data,
          admin:{ connect: { id:adminId } }
        },
      });
      return { message: 'Expense created successfully', expense };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.prisma.expense.findMany({
        include: { admin: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const expense = await this.prisma.expense.findUnique({
        where: { id },
        include: { admin: true },
      });
      if (!expense) throw new BadRequestException('Expense not found');
      return expense;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: any) {
    try {
      const expense = await this.prisma.expense.update({
        where: { id },
        data,
      });
      return { message: 'Expense updated successfully', expense };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.expense.delete({ where: { id } });
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
