import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Res,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LivestockGroupService } from './livestock-group.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FilesInterceptor } from '@nestjs/platform-express';
import { existsSync, statSync } from 'fs';
import { Response } from 'express';
import { LivestockGroupUpsertDto } from './dto/livestock-group-upsert.dto';

const livestockGroupPhotoStorage = diskStorage({
  destination: './uploads/livestock-group-photos',
  filename: (req, file, cb) => {
    const groupId = req.params.id;
    if (!groupId) {
      return cb(
        new Error('Livestock Group ID is missing for file naming.'),
        '',
      );
    }

    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const fileExtension = extname(file.originalname);
    cb(null, `${groupId}-${randomName}${fileExtension}`);
  },
});

@Controller('livestock-groups')
export class LivestockGroupController {
  constructor(private readonly groupService: LivestockGroupService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(id);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post()
  create(@Body() doc: LivestockGroupUpsertDto) {
    return this.groupService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(@Param('id') id: string, @Body() doc: LivestockGroupUpsertDto) {
    return this.groupService.upsert(doc, id);
  }

  @Get(':filename/photo')
  getGroupPhoto(@Param('filename') filename: string, @Res() res: Response) {
    if (filename.includes('..') || filename.includes('/')) {
      throw new BadRequestException('Invalid filename provided.');
    }

    const UPLOAD_ROOT = join(
      process.cwd(),
      'uploads',
      'livestock-group-photos',
    );

    const filePath = join(UPLOAD_ROOT, filename);

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      throw new NotFoundException(`Image not found: ${filename}`);
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType =
      {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
      }[ext || ''] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    return res.sendFile(filename, {
      root: UPLOAD_ROOT,
    });
  }

  @Put(':id/photos')
  @UseInterceptors(
    // max 10 pictures
    FilesInterceptor('photos', 10, {
      storage: livestockGroupPhotoStorage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(
            new BadRequestException(
              'Only image files (jpg, jpeg, png, gif) are allowed.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadGroupPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded.');
    }

    const fileNames = files.map((file) => file.filename);

    const updatedGroup = await this.groupService.updateGroupPhotos(
      id,
      fileNames,
    );

    return {
      message: 'Group photos uploaded successfully!',
      data: updatedGroup,
    };
  }
}
