import { UploadFailType } from '@/types/components/upload';
import { getApiUrl } from './common';
import useTranslation from '@/hooks/useTranslation';

export async function uploadFile(
  file: File,
  fileServiceId: number,
  onUploading?: () => void,
  onSuccessful?: (url: string) => void,
  onFailed?: (type?: UploadFailType) => void,
) {
  const { t } = useTranslation();
  onUploading && onUploading();

  try {
    const resp = await fetch(`${getApiUrl()}/api/file-service/${fileServiceId}/upload`, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    if (resp.ok) {
      onSuccessful && onSuccessful(await resp.json());
    } else {
      console.log(resp);
    }
  } catch (error) {
    onFailed && onFailed();
    console.error(error);
  }
}

export function checkFileSizeCanUpload(maxSize: number, fileSize: number) {
  return maxSize && fileSize / 1024 > maxSize;
}

export function getImageUrl(imageId: string) {
  return `${getApiUrl()}/api/file/${imageId}`;
}