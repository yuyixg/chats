import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { getFileEndpoint } from '@/utils/file';

import { FileServicesType } from '@/types/file';
import { ChatModelFileConfig } from '@/types/model';
import { getApiUrl } from '@/utils/common';
import { getUserSession } from '@/utils/user';

interface Props {
  onSuccessful?: (url: string) => void;
  onUploading?: () => void;
  onFailed?: () => void;
  children?: React.ReactNode;
  fileServerConfig?: {
    id: string;
    type: FileServicesType;
  };
  fileConfig: ChatModelFileConfig;
  maxFileSize?: number;
}

const UploadButton: React.FunctionComponent<Props> = ({
  onSuccessful,
  onUploading,
  onFailed,
  fileConfig,
  fileServerConfig,
  children,
}: Props) => {
  const { t } = useTranslation('chat');
  const uploadRef = useRef<HTMLInputElement>(null);
  const { fileMaxSize } = fileConfig || { fileMaxSize: 0 };
  const changeFile = async (event: any) => {
    const file = event?.target?.files[0];
    if (fileMaxSize && file?.size / 1024 > fileMaxSize) {
      toast.error(
        t(`The file size limit is {{fileSize}}`, {
          fileSize: fileMaxSize / 1024 + 'MB',
        }),
      );
      onFailed && onFailed();
      return;
    }

    try {
      if (file) {
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
            toast.error(t('File upload failed'));
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
                toast.error(response?.statusText);
              }
            })
            .catch((error) => {
              onFailed && onFailed();
              toast.error(t('File upload failed'));
              console.error(error);
            });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fileInput = document.getElementById('upload')!;
    fileInput.removeEventListener('change', changeFile);
    fileInput.addEventListener('change', changeFile);
    return () => {
      fileInput.removeEventListener('change', changeFile);
    };
  }, [fileServerConfig]);

  return (
    <div>
      <div
        onClick={() => {
          uploadRef.current?.click();
        }}
        className="absolute right-9 md:top-2.5 top-1.5 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-accent hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
      >
        {children}
      </div>

      <input
        ref={uploadRef}
        style={{ display: 'none' }}
        id="upload"
        type="file"
        accept="image/*"
      />
    </div>
  );
};

export default UploadButton;
