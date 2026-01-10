import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { R2Service } from '../../shared/storage/r2.service.js';
import { MediaRepository } from './media.repository.js';
import type {
  MediaListResponse,
  MediaResponse,
  StorageUsageResponse,
  UploadMediaResponse,
} from './dto/index.js';

// Allowed MIME types for upload
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private r2: R2Service,
    private mediaRepo: MediaRepository,
  ) {}

  /**
   * Upload a file for an organization
   */
  async upload(
    orgId: string,
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<UploadMediaResponse> {
    // Check if R2 is configured
    if (!this.r2.configured) {
      throw new BadRequestException(
        'Media uploads are not available. Storage is not configured.',
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Check storage limits
    const storageLimit = await this.mediaRepo.getStorageLimit(orgId);
    if (storageLimit === 0) {
      throw new ForbiddenException(
        'Image uploads require Pro or Enterprise plan. Free tier can only use external image URLs.',
      );
    }

    const currentUsage = await this.mediaRepo.getTotalSize(orgId);
    if (currentUsage + file.size > storageLimit) {
      const remaining = storageLimit - currentUsage;
      throw new BadRequestException(
        `Storage limit exceeded. You have ${this.formatBytes(remaining)} remaining. ` +
          `This file is ${this.formatBytes(file.size)}.`,
      );
    }

    // Generate unique key
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const key = `${orgId}/${randomUUID()}${ext}`;

    // Upload to R2
    const result = await this.r2.upload(key, file.buffer, file.mimetype);

    // Get image dimensions if applicable
    let width: number | undefined;
    let height: number | undefined;

    if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
      try {
        const dimensions = await this.getImageDimensions(file.buffer);
        width = dimensions.width;
        height = dimensions.height;
      } catch (e) {
        this.logger.warn(`Failed to get image dimensions: ${e}`);
      }
    }

    // Save to database
    const media = await this.mediaRepo.create({
      orgId,
      uploadedBy: userId,
      key: result.key,
      filename: file.originalname,
      contentType: file.mimetype,
      sizeBytes: file.size,
      url: result.url,
      width,
      height,
    });

    // Get updated storage usage
    const storage = await this.getStorageUsage(orgId);

    return {
      ...media,
      storage,
    };
  }

  /**
   * List media for an organization
   */
  async list(
    orgId: string,
    page: number,
    limit: number,
  ): Promise<MediaListResponse> {
    const { items, total } = await this.mediaRepo.list({ orgId, page, limit });

    return {
      items,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  /**
   * Get a single media item
   */
  async findById(orgId: string, mediaId: string): Promise<MediaResponse> {
    const media = await this.mediaRepo.findById(orgId, mediaId);
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  /**
   * Soft delete a media item
   */
  async delete(orgId: string, mediaId: string): Promise<void> {
    const media = await this.mediaRepo.findById(orgId, mediaId);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Soft delete in database (R2 cleanup handled by background job)
    await this.mediaRepo.softDelete(orgId, mediaId);
  }

  /**
   * Get storage usage for an organization
   */
  async getStorageUsage(orgId: string): Promise<StorageUsageResponse> {
    const [usedBytes, limitBytes] = await Promise.all([
      this.mediaRepo.getTotalSize(orgId),
      this.mediaRepo.getStorageLimit(orgId),
    ]);

    const remainingBytes = Math.max(0, limitBytes - usedBytes);
    const percentUsed = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;

    return {
      usedBytes,
      limitBytes,
      remainingBytes,
      usedFormatted: this.formatBytes(usedBytes),
      limitFormatted: limitBytes > 0 ? this.formatBytes(limitBytes) : 'N/A',
      percentUsed: Math.round(percentUsed * 100) / 100,
      canUpload: limitBytes > 0 && remainingBytes > 0,
    };
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get image dimensions from buffer (basic implementation)
   * For production, consider using sharp or similar library
   */
  private async getImageDimensions(
    buffer: Buffer,
  ): Promise<{ width: number; height: number }> {
    // PNG signature check
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      // PNG: dimensions at bytes 16-23
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    // JPEG signature check
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      // JPEG: need to parse SOF markers
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        if (marker === undefined) break;
        // SOF markers (baseline, progressive, etc.)
        if (marker >= 0xc0 && marker <= 0xc3) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    // GIF signature check
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      // GIF: dimensions at bytes 6-9 (little-endian)
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }

    // WebP signature check
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      // WebP: VP8 chunk at offset 12
      const chunk = buffer.toString('ascii', 12, 16);
      if (chunk === 'VP8 ') {
        // Lossy WebP
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      }
    }

    throw new Error('Unable to determine image dimensions');
  }
}
