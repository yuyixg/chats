import { useState } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { IconCheck, IconClipboard } from '@/components/Icons';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onCopy?: () => void;
}

export default function CopyButton(props: Props) {
  const { t } = useTranslation('client');
  const { value, onCopy } = props;
  const [isCopied, setIsCopied] = useState<Boolean>(false);

  const handleCopy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      onCopy && onCopy();
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
      toast.success(t('Copy Successful'));
    });
  };

  return (
    <Button
      variant="ghost"
      className="items-center rounded bg-none p-1 h-auto w-auto"
      onClick={handleCopy}
    >
      {isCopied ? (
        <IconCheck stroke={'#7d7d7d'} size={18} />
      ) : (
        <IconClipboard stroke={'#7d7d7d'} size={18} />
      )}
      {/* {isCopied ? t('Copied!') : t('Click Copy')} */}
    </Button>
  );
}
