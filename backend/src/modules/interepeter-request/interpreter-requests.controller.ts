import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { InterpreterRequestsService } from './interpreter-requests.service';

type InterpreterRequestCreateInput = {
  userInfo: {
    fullName: string;
    email: string;
    phone: string;
    preferredContactMethod: string;
  };
  requestDetails: {
    languageFrom: string;
    languageTo: string;
    serviceType: string;
    dateTime: string;
    location: string;
    durationMinutes: number;
  };
  interpreterPreferences: {
    type: string;
    specialRequirements?: string;
  };
  context: {
    reason: string;
    urgencyLevel: string;
  };
  additionalNotes?: string;
};

@Controller('interpreter-requests')
export class InterpreterRequestsController {
  constructor(
    private readonly interpreterRequestsService: InterpreterRequestsService,
  ) {}

  @Post()
  async create(@Body() data: InterpreterRequestCreateInput) {
    try {
      return await this.interpreterRequestsService.createInterpreterRequest(data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}