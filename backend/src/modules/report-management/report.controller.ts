import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReportFileFields, ReportUploadConfig } from 'src/common/utils/file-upload.utils';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ✅ Create a new report (uses admin ID from req.user)
  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(ReportFileFields,ReportUploadConfig))
  async create(@Body() data: any, @Req() req: RequestWithAdmin, @UploadedFiles() files: { reportUrl?: Express.Multer.File[]}) {
     const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);
    if(files.reportUrl){
        data.reportUrl = `/uploads/reports/${files.reportUrl[0].filename}`;
    }
    return this.reportService.create(data, adminId);
  }

  // ✅ Get all reports
  @Get()
  async findAll() {
    return this.reportService.findAll();
  }

  // ✅ Get one report
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  // ✅ Update report
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor(ReportFileFields,ReportUploadConfig))
  async update(@Param('id') id: string, @Body() data: any, @UploadedFiles() files: { reportUrl?: Express.Multer.File[]}) {
    if(files.reportUrl){
        data.reportUrl = `/uploads/reports/${files.reportUrl[0].filename}`;
    }
    return this.reportService.update(id, data);
  }

  // ✅ Delete report
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }
}
