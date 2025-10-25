import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { InterpreterAuthGuard, RequestWithInterpreter } from 'src/guards/interpreter-auth.guard';


@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // ✅ Create message
  @Post()
  @UseGuards(InterpreterAuthGuard)
  create(@Body() body: any,@Req() req: RequestWithInterpreter) {
    body.interpreterId = req.interpreter.id;
    return this.messageService.create(body);
  }

  // ✅ Get all messages
  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  // ✅ Get a single message
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  // ✅ Get messages by Request
  @Get('request/:requestId')
  findByRequest(@Param('requestId') requestId: string) {
    return this.messageService.findByRequest(requestId);
  }

  // ✅ Update content
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.messageService.update(id, body);
  }

  // ✅ Delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
