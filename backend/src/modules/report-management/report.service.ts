import { Injectable, BadRequestException } from '@nestjs/common';
import { deleteFile } from 'src/common/utils/file-upload.utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create report with adminId
  async create(data: any, adminId: string) {
    try {
      return await this.prisma.report.create({
        data: {
          ...data,
          admin: { connect: { id: adminId } }
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create report: ' + error.message);
    }
  }

  // ✅ Fetch all reports
  async findAll() {
    try {
      return await this.prisma.report.findMany({
        include: { admin: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch reports: ' + error.message);
    }
  }

  // ✅ Fetch one report by ID
  async findOne(id: string) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id },
        include: { admin: true },
      });
      if (!report) throw new BadRequestException('Report not found');
      return report;
    } catch (error) {
      throw new BadRequestException('Failed to fetch report: ' + error.message);
    }
  }

  // ✅ Update report
  async update(id: string, data: any) {
    try {
      if(data.reportUrl){
        const report =  await this.prisma.report.findUnique({ where : { id }})
        if(!report) {
           deleteFile(data.reportUrl)
           throw new BadRequestException('Report not found'); 
          }
          deleteFile(report.reportUrl)
          console.log('Deleted the previews report file Succesfully');
          
      }

      return await this.prisma.report.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update report: ' + error.message);
    }
  }

  // ✅ Delete report
  async remove(id: string) {
    try {
      return await this.prisma.report.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete report: ' + error.message);
    }
  }
}
