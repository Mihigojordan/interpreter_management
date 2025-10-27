import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
  ) { }

  // ✅ CREATE
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

  // ✅ VIEW ALL
  async getAllRequests() {
    try {
      return await this.prisma.interpreterRequest.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve interpreter requests');
    }
  }
  async getAllRequestsByInterpreters(interpreterId: string) {
    try {
      return await this.prisma.interpreterRequest.findMany({
        where: { interpreterId, status: 'accepted' },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve interpreter requests');
    }
  }

  // ✅ VIEW ONE
  async getRequestById(id: string) {
    try {

      const request = await this.prisma.interpreterRequest.findUnique({
        where: { id: id },
      });

      if (!request) {
        throw new NotFoundException(`Interpreter request with ID ${id} not found`);
      }

      return request;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ APPROVE REQUEST
  async approveRequest(id: string, interpreterId: string,amount:number) {
    try {


      // Check if request exists
      const request = await this.prisma.interpreterRequest.findUnique({
        where: { id: id },
      });
      if (!request) {
        throw new NotFoundException(`Interpreter request with ID ${id} not found`);
      }

      // Check if interpreter exists
      const interpreter = await this.prisma.interpreter.findUnique({
        where: { id: interpreterId },
      });
      if (!interpreter) {
        throw new NotFoundException(`Interpreter with ID ${interpreterId} not found`);
      }

      // Update request status and assign interpreter
      const updatedRequest = await this.prisma.interpreterRequest.update({
        where: { id: id },
        data: {
          status: 'accepted',
          interpreterId,
          amount
        },
        include: { interpreter: true }, // Include interpreter details
      });

      // Send approval email
      await this.emailService.sendEmail(
        request.email,
        'Interpreter Request Approved',
        'interpreter-request-approved',
        {
          fullName: request.fullName,
          languageFrom: request.languageFrom,
          languageTo: request.languageTo,
          serviceType: request.serviceType,
          dateTime: request.dateTime.toISOString(),
          location: request.location,
          durationMinutes: request.durationMinutes,
          interpreterName: interpreter.name,
        },
      );

      return updatedRequest;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  async requestPayment(requestId: string, amount: string) {

    try {

      const request = await this.prisma.interpreterRequest.findUnique(
        {
          where: {
            id: requestId
          }
        })

      if (!request) throw new NotFoundException('request was not found')

      await this.emailService.sendEmail(
        request.email,
        'Payment Request',
        'payment-request',  // the .hbs template name
        {
          firstName: request.fullName,
          amount,
          currency: "RWF",
          dueDate: new Date().toDateString(),
          contactEmail: 'info@vugalink.rw',
          contactPhone: '+250 788 376 668',
          companyName: 'Vuga Link Ltd',
          year: new Date().getFullYear(),
        },
      );


    } catch (error) {
      throw new BadRequestException(error.message);
    }

  }




  // ✅ REJECT REQUEST
  async rejectRequest(id: string, reason: string) {
    try {
      const numericId = id

      // Check if request exists
      const request = await this.prisma.interpreterRequest.findUnique({
        where: { id: numericId },
      });
      if (!request) {
        throw new NotFoundException(`Interpreter request with ID ${id} not found`);
      }

      // Update request status and store rejection reason
      const updatedRequest = await this.prisma.interpreterRequest.update({
        where: { id: numericId },
        data: {
          status: 'rejected',
          additionalNotes: reason, // Store rejection reason in additionalNotes
        },
      });

      // Send rejection email
      await this.emailService.sendEmail(
        request.email,
        'Interpreter Request Rejected',
        'interpreter-request-rejected',
        {
          fullName: request.fullName,
          languageFrom: request.languageFrom,
          languageTo: request.languageTo,
          serviceType: request.serviceType,
          dateTime: request.dateTime.toISOString(),
          location: request.location,
          durationMinutes: request.durationMinutes,
          reason,
        },
      );

      return updatedRequest;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}