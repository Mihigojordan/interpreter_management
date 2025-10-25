import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
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

type ApproveRequestInput = {
  interpreterId: string;
};

type RejectRequestInput = {
  reason: string;
};

@Controller('interpreter-requests')
export class InterpreterRequestsController {
  constructor(
    private readonly interpreterRequestsService: InterpreterRequestsService,
  ) {}

  // ✅ CREATE new interpreter request
  @Post()
  async create(@Body() data: InterpreterRequestCreateInput) {
    try {
      return await this.interpreterRequestsService.createInterpreterRequest(data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ VIEW ALL interpreter requests
  @Get()
  async findAll() {
    try {
      return await this.interpreterRequestsService.getAllRequests();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ VIEW ONE interpreter request by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.interpreterRequestsService.getRequestById(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ APPROVE interpreter request
  @Post(':id/approve')
  async approveRequest(@Param('id') id: string, @Body() data: ApproveRequestInput) {
    try {
      return await this.interpreterRequestsService.approveRequest(id, data.interpreterId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ REJECT interpreter request
  @Post(':id/reject')
  async rejectRequest(@Param('id') id: string, @Body() data: RejectRequestInput) {
    try {
      return await this.interpreterRequestsService.rejectRequest(id, data.reason);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}