import { useEffect, useRef } from 'react';
import { checkFileSizeCanUpload, uploadFile } from '@/utils/uploadFile';
import { ChatModelFileConfig } from '@/types/model';
import { ImageDef } from '@/types/chat';

interface Props {
  onSuccessful?: (def: ImageDef) => void;
  onUploading?: () => void;
  onFailed?: (reason: string | null) => void;
  children?: React.ReactNode;
  fileServiceId: number;
  fileConfig: ChatModelFileConfig;
  maxFileSize?: number;
}

const UploadButton: React.FunctionComponent<Props> = ({
  onSuccessful,
  onUploading,
  onFailed,
  fileConfig,
  fileServiceId,
  children,
}: Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const { maxSize } = fileConfig || { maxSize: 0 };
  const changeFile = async (event: any) => {
    const file = event?.target?.files[0];
    if (checkFileSizeCanUpload(maxSize, file.size)) {
      onFailed && onFailed('File is too large.');
      return;
    }

    try {
      if (file) {
        uploadFile(file, fileServiceId, onUploading, onSuccessful, onFailed);
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
  }, [fileServiceId]);

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
