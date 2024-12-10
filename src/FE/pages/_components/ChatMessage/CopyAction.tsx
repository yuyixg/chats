import { useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { IconCheck, IconCopy } from '@/components/Icons';
import Tips from '@/pages/_components/Tips/Tips';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface Props {
  triggerClassName?: string;
  text?: string;
  hidden?: boolean;
}
const CopyAction = (props: Props) => {
  const { text, triggerClassName, hidden = false } = props;
  const { t } = useTranslation();
  const [messagedCopied, setMessageCopied] = useState(false);

  const copyOnClick = (content?: string) => {
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(content || '').then(() => {
      setMessageCopied(true);
      setTimeout(() => {
        setMessageCopied(false);
      }, 2000);
    });
  };

  const Render = () => {
    return (
      <>
        {messagedCopied ? (
          <Button variant="ghost" className="p-1 m-0 h-auto">
            <IconCheck className="text-green-500 dark:text-green-400" />
          </Button>
        ) : (
          <Tips
            className="h-[28px]"
            trigger={
              <Button
                variant="ghost"
                className={cn('p-1 m-0 h-auto', triggerClassName)}
                onClick={() => copyOnClick(text)}
              >
                <IconCopy />
              </Button>
            }
            side="bottom"
            content={t('Copy')!}
          />
        )}
      </>
    );
  };

  return <>{!hidden && Render()}</>;
};

export default CopyAction;
