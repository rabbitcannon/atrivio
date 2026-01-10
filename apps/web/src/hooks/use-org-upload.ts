'use client';

import * as React from 'react';
import { toast } from 'sonner';

export interface OrgUploadedFile {
  id: string;
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
  width?: number;
  height?: number;
}

export interface StorageUsage {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  usedFormatted: string;
  limitFormatted: string;
  percentUsed: number;
  canUpload: boolean;
}

interface UseOrgUploadProps {
  orgId: string;
  onUploadComplete?: (file: OrgUploadedFile) => void;
  onUploadError?: (error: Error) => void;
}

/**
 * Hook for uploading files to org-scoped R2 storage
 *
 * Features:
 * - Uploads to /api/v1/organizations/:orgId/media/upload
 * - Tracks progress (simulated for now)
 * - Returns storage usage after upload
 * - Falls back to blob URLs if not on Pro/Enterprise tier
 */
export function useOrgUpload({
  orgId,
  onUploadComplete,
  onUploadError,
}: UseOrgUploadProps) {
  const [uploadedFile, setUploadedFile] = React.useState<OrgUploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [storage, setStorage] = React.useState<StorageUsage>();

  const uploadFile = React.useCallback(
    async (file: File): Promise<OrgUploadedFile | undefined> => {
      if (!orgId) {
        toast.error('Organization context required for uploads');
        return undefined;
      }

      setIsUploading(true);
      setUploadingFile(file);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress while uploading
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
        const response = await fetch(
          `${apiUrl}/organizations/${orgId}/media/upload`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
          }
        );

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.message || `Upload failed with status ${response.status}`;

          // Check if it's a tier restriction
          if (response.status === 403) {
            // Fall back to blob URL for free tier
            toast.info(
              'Image uploads require Pro plan. Using preview mode.'
            );
            const blobFile: OrgUploadedFile = {
              id: `blob-${Date.now()}`,
              key: `local/${file.name}`,
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file),
            };

            setProgress(100);
            setUploadedFile(blobFile);
            onUploadComplete?.(blobFile);
            return blobFile;
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        setProgress(100);

        const uploaded: OrgUploadedFile = {
          id: data.id,
          key: data.key,
          name: data.filename,
          size: data.sizeBytes,
          type: data.contentType,
          url: data.url,
          width: data.width ?? undefined,
          height: data.height ?? undefined,
        };

        setUploadedFile(uploaded);
        setStorage(data.storage);
        onUploadComplete?.(uploaded);

        return uploaded;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Upload failed');
        toast.error(err.message);
        onUploadError?.(err);

        // Fall back to blob URL on any error
        const blobFile: OrgUploadedFile = {
          id: `blob-${Date.now()}`,
          key: `local/${file.name}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        };

        setProgress(100);
        setUploadedFile(blobFile);
        return blobFile;
      } finally {
        setIsUploading(false);
        setUploadingFile(undefined);
        // Reset progress after a short delay to allow UI to show 100%
        setTimeout(() => setProgress(0), 500);
      }
    },
    [orgId, onUploadComplete, onUploadError]
  );

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
    storage,
  };
}

/**
 * Hook to get storage usage for an organization
 */
export function useStorageUsage(orgId: string) {
  const [storage, setStorage] = React.useState<StorageUsage>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error>();

  const fetchStorage = React.useCallback(async () => {
    if (!orgId) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const response = await fetch(
        `${apiUrl}/organizations/${orgId}/media/storage`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch storage usage');
      }

      const data = await response.json();
      setStorage(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  React.useEffect(() => {
    fetchStorage();
  }, [fetchStorage]);

  return { storage, isLoading, error, refetch: fetchStorage };
}
