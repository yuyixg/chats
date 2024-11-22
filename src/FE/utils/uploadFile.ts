import { UploadFailType } from '@/types/components/upload';
import { getApiUrl } from './common';
import { getUserSession } from './user';
import toast from 'react-hot-toast';
import useTranslation from '@/hooks/useTranslation';

export async function uploadFile(
  file: File,
  fileServiceId: number,
  onUploading?: () => void,
  onSuccessful?: (url: string) => void,
  onFailed?: (type?: UploadFailType) => void,
) {
  const { t } = useTranslation();
  const url = `${getApiUrl()}/api/files/${fileServiceId}`;
  onUploading && onUploading();

  const fileType = file.name.substring(
    file.name.lastIndexOf('.'),
    file.name.length,
  );
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getUserSession()}`,
    },
    body: JSON.stringify({
      fileName: file.name.replace(fileType, ''),
      fileType: fileType.replace('.', ''),
    }),
  });

  if (!res.ok) {
    toast.error(t(await res.text()));
    return;
  }

  const { putUrl, getUrl } = await res.json();

  fetch(putUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': '',
    },
  })
    .then((response) => {
      if (response.ok) {
        onSuccessful && onSuccessful(getUrl);
      } else {
        console.log(response);
      }
    })
    .catch((error) => {
      onFailed && onFailed();
      console.error(error);
    });
}

export function checkFileSizeCanUpload(maxSize: number, fileSize: number) {
  return maxSize && fileSize / 1024 > maxSize;
}
