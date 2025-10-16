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
  UploadedFiles,
  BadRequestException,
  Res,
  Patch,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import { existsSync, statSync } from 'fs';
import { UpdateClaimStatusDto } from './dto/update-livestock-group-status.dto';
import { ClaimUpsertDto } from './dto/claim-upsert.dto';
import { ClaimsService } from './claims.service';

const evidencePhotoStorage = diskStorage({
  destination: './uploads/claim-evidence',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const fileExtension = extname(file.originalname);
    cb(null, `${randomName}${fileExtension}`);
  },
});

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimService: ClaimsService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.claimService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.claimService.findOne(id);
    if (!doc) {
      throw new NotFoundException('Claim not found');
    }
    return doc;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() doc: ClaimUpsertDto) {
    return this.claimService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(@Param('id') id: string, @Body() doc: ClaimUpsertDto) {
    return this.claimService.upsert(doc, id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/process')
  async processClaim(
    @Param('id') id: string,
    @Body() doc: UpdateClaimStatusDto,
  ) {
    const updatedClaim = await this.claimService.processClaim(id, doc);
    return {
      message: `Claim status successfully updated to "${doc.status}".`,
      data: updatedClaim,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id/evidence')
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      // Field name is 'photos'
      storage: evidencePhotoStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return cb(
            new BadRequestException('Only image files are allowed.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadEvidencePhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded.');
    }
    const fileNames = files.map((file) => file.filename);
    const updatedClaim = await this.claimService.updateEvidencePhotos(
      id,
      fileNames,
    );
    return {
      message: 'Evidence photos uploaded successfully!',
      data: updatedClaim,
    };
  }

  @Get(':filename/evidence')
  getEvidencePhoto(@Param('filename') filename: string, @Res() res: Response) {
    if (filename.includes('..') || filename.includes('/')) {
      throw new BadRequestException('Invalid filename provided.');
    }

    const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'claim-evidence');
    const filePath = join(UPLOAD_ROOT, filename);

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      throw new NotFoundException(`Evidence photo not found: ${filename}`);
    }

    return res.sendFile(filename, { root: UPLOAD_ROOT });
  }
}
