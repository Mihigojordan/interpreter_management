import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InterpreterService } from './interpreter.service';

@Controller('interpreters')
export class InterpreterController {
  constructor(private readonly interpreterService: InterpreterService) {}

  @Post()
  create(@Body() data: any) {
    return this.interpreterService.create(data);
  }

  @Get()
  findAll() {
    return this.interpreterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interpreterService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.interpreterService.update(id, data);
  }

  // ✅ Accept interpreter
  @Patch('accept/:id')
  async acceptInterpreter(@Param('id') id: string) {
    return this.interpreterService.acceptInterpreter(id);
  }

  // ✅ Reject interpreter
  @Patch('reject/:id')
  async rejectInterpreter(@Param('id') id: string) {
    return this.interpreterService.rejectInterpreter(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interpreterService.remove(id);
  }
}
