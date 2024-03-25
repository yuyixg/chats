import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';

interface Props {
  onSuccessful?: (url: string) => void;
  onUploading?: () => void;
  onFailed?: () => void;
  children?: React.ReactNode;
  maxFileSize?: number;
}

const UploadButton: React.FunctionComponent<Props> = ({
  onSuccessful,
  onUploading,
  onFailed,
  maxFileSize,
  children,
}: Props) => {
  const { t } = useTranslation('chat');
  const uploadRef = useRef<HTMLInputElement>(null);

  const changeFile = async (event: any) => {
    const fileForm = new FormData();
    fileForm.append('file', event?.target?.files[0]);
    console.log(event?.target?.files);
    try {
      const response = await fetch('/api/files/local', {
        method: 'POST',
        body: fileForm,
      });
      const data = await response.json();
      if (!response.ok) {
        throw data;
      }
      toast.success('Upload!');
    } catch (error) {
      console.log(error);
    }
    // const file = event?.target?.files[0];
    // if (maxFileSize && file?.size / 1024 > maxFileSize) {
    //   toast.error(
    //     t(`The file size limit is {{fileSize}}`, {
    //       fileSize: maxFileSize / 1024 + 'MB',
    //     })
    //   );
    //   onFailed && onFailed();
    //   return;
    // }
    // if (file) {
    //   onUploading && onUploading();
    //   const fileType = file.name.substring(
    //     file.name.lastIndexOf('.'),
    //     file.name.length
    //   );
    //   const res = await fetch('/api/aws', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       fileName: file.name.replace(fileType, ''),
    //       fileType: fileType.replace('.', ''),
    //     }),
    //   });
    //   const { putUrl, getUrl } = await res.json();

    //   fetch(putUrl, {
    //     method: 'PUT',
    //     body: file,
    //     headers: {
    //       'Content-Type': '',
    //     },
    //   })
    //     .then((response) => {
    //       if (response.ok) {
    //         onSuccessful && onSuccessful(getUrl);
    //       } else {
    //         toast.error(response?.statusText);
    //       }
    //     })
    //     .catch((error) => {
    //       onFailed && onFailed();
    //       toast.error(t('File upload failed'));
    //       console.error(error);
    //     });
    // }
  };

  useEffect(() => {
    const fileInput = document.getElementById('upload')!;
    fileInput.addEventListener('change', changeFile);
    return () => {
      fileInput.removeEventListener('change', changeFile);
    };
  }, []);

  return (
    <div>
      <div
        onClick={() => {
          uploadRef.current?.click();
        }}
        className='absolute right-9 md:top-2 top-1.5 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200'
      >
        {children}
      </div>

      <input
        ref={uploadRef}
        style={{ display: 'none' }}
        id='upload'
        type='file'
        accept='image/*'
      />
    </div>
  );
};

export default UploadButton;
