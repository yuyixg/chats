import { IconLoader2 } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  onSuccessful: (url: string) => void;
  children?: React.ReactNode;
}

const UploadButton: React.FunctionComponent<Props> = ({
  onSuccessful,
  children,
}: Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const changeFile = async (event: any) => {
    const file = event?.target?.files[0];
    if (file) {
      setLoading(true);
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
            onSuccessful(getUrl);
          } else {
            toast.error(response?.statusText);
          }
        })
        .catch((error) => {
          toast.error('文件上传失败');
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
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
      {loading ? (
        <div className='absolute right-9 top-2 rounded-sm p-1 text-neutral-800 opacity-60'>
          <IconLoader2 className='h-4 w-4 animate-spin' />
        </div>
      ) : (
        <div
          onClick={() => {
            uploadRef.current?.click();
          }}
          className='absolute right-9 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200'
        >
          {children}
        </div>
      )}

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
