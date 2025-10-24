import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../global/email/email.service';


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

@Injectable()
export class InterpreterRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createInterpreterRequest(data: InterpreterRequestCreateInput) {
    try {
      const interpreterRequest = await this.prisma.interpreterRequest.create({
        data: {
          fullName: data.userInfo.fullName,
          email: data.userInfo.email,
          phone: data.userInfo.phone,
          preferredContactMethod: data.userInfo.preferredContactMethod,
          languageFrom: data.requestDetails.languageFrom,
          languageTo: data.requestDetails.languageTo,
          serviceType: data.requestDetails.serviceType,
          dateTime: new Date(data.requestDetails.dateTime),
          location: data.requestDetails.location,
          durationMinutes: data.requestDetails.durationMinutes,
          interpreterType: data.interpreterPreferences.type,
          specialRequirements: data.interpreterPreferences.specialRequirements,
          reason: data.context.reason,
          urgencyLevel: data.context.urgencyLevel,
          additionalNotes: data.additionalNotes,
        },
      });

      await this.emailService.sendEmail(
        data.userInfo.email,
        'Interpreter Request Received',
        'interpreter-request-confirmation',
        {
          fullName: data.userInfo.fullName,
          languageFrom: data.requestDetails.languageFrom,
          languageTo: data.requestDetails.languageTo,
          serviceType: data.requestDetails.serviceType,
          dateTime: data.requestDetails.dateTime,
          location: data.requestDetails.location,
          durationMinutes: data.requestDetails.durationMinutes,
        },
      );

      return interpreterRequest;
    } catch (error) {
      throw new BadRequestException('Failed to create interpreter request');
    }
  }
}