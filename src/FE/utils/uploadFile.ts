import { UploadFailType } from '@/types/components/upload';
import { FileServicesType } from '@/types/file';

import { getApiUrl } from './common';
import { getFileEndpoint } from './file';
import { getUserSession } from './user';

export async function uploadFile(
  file: File,
  fileServerConfig: {
    id: string;
    type: FileServicesType;
  },
  onUploading?: () => void,
  onSuccessful?: (url: string) => void,
  onFailed?: (type?: UploadFailType) => void,
) {
  const { id: serverId, type: serverType } = fileServerConfig!;
  const url = `${getApiUrl()}/${getFileEndpoint(serverType, serverId)}`;
  onUploading && onUploading();
  if (serverType === FileServicesType.Local) {
    const fileForm = new FormData();
    fileForm.append('file', file);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getUserSession()}`,
      },
      body: fileForm,
    });
    const { getUrl } = await response.json();
    if (!response.ok) {
      onFailed && onFailed();
    }
    onSuccessful && onSuccessful(getUrl);
  } else {
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
}

export function checkFileSizeCanUpload(maxSize: number, fileSize: number) {
  return maxSize && fileSize / 1024 > maxSize;
}
