export interface MediaResponse {
  id: string;
  orgId: string;
  key: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
}

export interface MediaListResponse {
  items: MediaResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface StorageUsageResponse {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  usedFormatted: string;
  limitFormatted: string;
  percentUsed: number;
  canUpload: boolean;
}

export interface UploadMediaResponse extends MediaResponse {
  storage: StorageUsageResponse;
}
