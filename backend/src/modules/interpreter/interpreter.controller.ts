import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { InterpreterService } from './interpreter.service';
import {
  InterpreterFields,
  InterpreterUploadConfig,
} from 'src/common/utils/file-upload.utils';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('interpreters')
export class InterpreterController {
  constructor(private readonly interpreterService: InterpreterService) {}

  // ✅ Create interpreter with file uploads
  @Post()
  @UseInterceptors(FileFieldsInterceptor(InterpreterFields, InterpreterUploadConfig))
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      interpeterPhoto?: Express.Multer.File[];
      interpreterCv?: Express.Multer.File[];
      interpreterSupportFile?: Express.Multer.File[];
    },
  ) {
    if (files?.interpeterPhoto?.length) {
      body.photoUrl = `/uploads/interpreter_photos/${files.interpeterPhoto[0].filename}`;
    }
    if (files?.interpreterCv?.length) {
      body.cvUrl = `/uploads/cv_files/${files.interpreterCv[0].filename}`;
    }
    if (files?.interpreterSupportFile?.length) {
      body.supportingFile = `/uploads/interpreter_support_files/${files.interpreterSupportFile[0].filename}`;
    }

    body.languages = JSON.parse(body.languages);

    return this.interpreterService.create(body);
  }

  // ✅ Get all interpreters
  @Get()
  findAll() {
    return this.interpreterService.findAll();
  }

  // ✅ Get one interpreter
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interpreterService.findOne(id);
  }

  // ✅ Update interpreter with optional file uploads
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor(InterpreterFields, InterpreterUploadConfig))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      interpeterPhoto?: Express.Multer.File[];
      interpreterCv?: Express.Multer.File[];
      interpreterSupportFile?: Express.Multer.File[];
    },
  ) {
    if (files?.interpeterPhoto?.length) {
      body.photoUrl = `/uploads/interpreter_photos/${files.interpeterPhoto[0].filename}`;
    }
    if (files?.interpreterCv?.length) {
      body.cvUrl = `/uploads/cv_files/${files.interpreterCv[0].filename}`;
    }
    if (files?.interpreterSupportFile?.length) {
      body.supportingFile = `/uploads/interpreter_support_files/${files.interpreterSupportFile[0].filename}`;
    }

    return this.interpreterService.update(id, body);
  }

  // ✅ Accept interpreter
  @Patch('accept/:id')
  async acceptInterpreter(@Param('id') id: string) {
    return this.interpreterService.acceptInterpreter(id);
  }

  // ✅ Reject interpreter with reason
  @Patch('reject/:id')
  async rejectInterpreter(@Param('id') id: string, @Body() data: any) {
    return this.interpreterService.rejectInterpreter(id, data.reason);
  }

  // ✅ Delete interpreter
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interpreterService.remove(id);
  }
}
