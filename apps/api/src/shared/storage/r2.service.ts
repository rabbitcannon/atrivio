import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface R2UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class R2Service implements OnModuleInit {
  private readonly logger = new Logger(R2Service.name);
  private client: S3Client | null = null;
  private bucket: string = '';
  private publicUrl: string = '';
  private isConfigured = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    const bucketName = this.config.get<string>('R2_BUCKET_NAME');
    const publicUrl = this.config.get<string>('R2_PUBLIC_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      this.logger.warn(
        'R2 storage not configured - media uploads will be disabled. ' +
          'Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME to enable.',
      );
      return;
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucket = bucketName;
    this.publicUrl = publicUrl || `https://${bucketName}.${accountId}.r2.dev`;
    this.isConfigured = true;

    this.logger.log(`R2 storage configured with bucket: ${this.bucket}`);
  }

  /**
   * Check if R2 is properly configured
   */
  get configured(): boolean {
    return this.isConfigured;
  }

  /**
   * Upload a file to R2
   */
  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<R2UploadResult> {
    if (!this.client) {
      throw new Error('R2 storage is not configured');
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable', // 1 year cache
      }),
    );

    return {
      key,
      url: `${this.publicUrl}/${key}`,
    };
  }

  /**
   * Delete a file from R2
   */
  async delete(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('R2 storage is not configured');
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  /**
   * Get a presigned URL for direct client upload (for large files)
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('R2 storage is not configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Get the public URL for a stored file
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
