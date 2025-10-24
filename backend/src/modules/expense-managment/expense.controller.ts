import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // ✅ Create Expense (adminId passed separately)
  @Post()
  @UseGuards(AdminJwtAuthGuard)
  async create(@Body() body: any, @Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);

    try {
      return await this.expenseService.create(body, adminId);
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Get()
  async findAll() {
    return this.expenseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Put(':id')

  async update(@Param('id') id: string, @Body() body: any) {
    return this.expenseService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
