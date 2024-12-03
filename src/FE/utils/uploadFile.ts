import { getApiUrl } from './common';
import useTranslation from '@/hooks/useTranslation';
import { getUserSession } from './user';
import { ImageDef } from '@/types/chat';

export async function uploadFile(
  file: File,
  fileServiceId: number,
  onUploading?: () => void,
  onSuccessful?: (def: ImageDef) => void,
  onFailed?: (reason: string | null) => void,
) {
  const { t } = useTranslation();
  onUploading && onUploading();

  try {
    const form = new FormData();
    form.append('file', file);
    const resp = await fetch(`${getApiUrl()}/api/file-service/${fileServiceId}/upload`, {
      method: 'PUT',
      body: form,
      headers: {
        Authorization: `Bearer ${getUserSession()}`,
      },
    });
    if (resp.ok) {
      onSuccessful && onSuccessful(await resp.json());
    } else {
      onFailed && onFailed(await resp.text());
    }
  } catch (error) {
    onFailed && onFailed(error as any);
  }
}

export function checkFileSizeCanUpload(maxSize: number, fileSize: number) {
  return maxSize && fileSize / 1024 > maxSize;
}