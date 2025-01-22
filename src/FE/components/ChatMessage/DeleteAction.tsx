import useTranslation from '@/hooks/useTranslation';

import { IconTrash } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface Props {
  disabled?: boolean;
  visible?: boolean;
  onDelete: () => void;
}

const DeleteAction = (props: Props) => {
  const { onDelete, disabled, visible } = props;
  const { t } = useTranslation();

  return (
    <Tips
      className="h-[28px]"
      trigger={
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            visible ? 'visible' : 'invisible',
            'p-1 m-0 h-auto group-hover:visible focus:visible',
          )}
          onClick={(e) => {
            onDelete();
            e.stopPropagation();
          }}
        >
          <IconTrash />
        </Button>
      }
      content={t('Delete message')!}
    />
  );
};

export default DeleteAction;
