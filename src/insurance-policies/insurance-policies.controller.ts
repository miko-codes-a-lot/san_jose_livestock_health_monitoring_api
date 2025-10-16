import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import { existsSync, statSync } from 'fs';
import { InsurancePolicyUpsertDto } from './dto/insurance-policy-upsert.dto';
import { InsurancePolicyService } from './insurance-policies.service';
import { UpdateInsurancePolicyStatusDto } from './dto/update-insurance-policy-status.dto';

// Multer configuration for storing policy documents
const policyDocumentStorage = diskStorage({
  destination: './uploads/policy-documents',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const fileExtension = extname(file.originalname);
    cb(null, `${randomName}${fileExtension}`);
  },
});

@Controller('insurance-policies')
export class InsurancePolicyController {
  constructor(private readonly policyService: InsurancePolicyService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.policyService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.policyService.findOne(id);
    if (!doc) {
      throw new NotFoundException('Insurance Policy not found');
    }
    return doc;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() doc: InsurancePolicyUpsertDto) {
    return this.policyService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(@Param('id') id: string, @Body() doc: InsurancePolicyUpsertDto) {
    return this.policyService.upsert(doc, id);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id/document')
  @UseInterceptors(
    FileInterceptor('document', {
      storage: policyDocumentStorage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for documents
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/i)) {
          return cb(
            new BadRequestException('Only document/image files are allowed.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadPolicyDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const updatedPolicy = await this.policyService.updatePolicyDocument(
      id,
      file.filename,
    );

    return {
      message: 'Policy document uploaded successfully!',
      data: updatedPolicy,
    };
  }

  @Get(':filename/document')
  getPolicyDocument(@Param('filename') filename: string, @Res() res: Response) {
    if (filename.includes('..') || filename.includes('/')) {
      throw new BadRequestException('Invalid filename provided.');
    }

    const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'policy-documents');
    const filePath = join(UPLOAD_ROOT, filename);

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      throw new NotFoundException(`Document not found: ${filename}`);
    }

    // Send the file for viewing/download
    return res.sendFile(filename, { root: UPLOAD_ROOT });
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() doc: UpdateInsurancePolicyStatusDto,
  ) {
    const updatedGroup = await this.policyService.updateStatus(id, doc.status);

    return {
      message: `Insurance Policy status successfully updated to "${doc.status}".`,
      data: updatedGroup,
    };
  }
}
