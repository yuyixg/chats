import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface Props {
  onSuccessful?: (url: string) => void;
  onUploading?: () => void;
  onFailed?: () => void;
  children?: React.ReactNode;
}

const UploadButton: React.FunctionComponent<Props> = ({
  onSuccessful,
  onUploading,
  onFailed,
  children,
}: Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  const changeFile = async (event: any) => {
    const file = event?.target?.files[0];
    if (file) {
      onUploading && onUploading();
      const fileType = file.name.substring(
        file.name.lastIndexOf('.'),
        file.name.length
      );
      const res = await fetch('/api/aws', {
        method: 'POST',
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
          toast.error('文件上传失败');
          console.error(error);
        });
    }
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
