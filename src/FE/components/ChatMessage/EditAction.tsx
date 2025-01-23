import useTranslation from '@/hooks/useTranslation';

import { IconEdit } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface Props {
  disabled?: boolean;
  isHoverVisible?: boolean;
  hovered?: boolean;
  onToggleEditing: () => void;
}

const EditAction = (props: Props) => {
  const { onToggleEditing, disabled, isHoverVisible, hovered } = props;
  const { t } = useTranslation();

  return (
    <Tips
      className="h-[28px]"
      trigger={
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            isHoverVisible ? 'invisible' : 'visible',
            hovered && 'bg-muted',
            'p-1 m-0 h-auto group-hover:visible focus:visible',
          )}
          onClick={(e) => {
            onToggleEditing();
            e.stopPropagation();
          }}
        >
          <IconEdit />
        </Button>
      }
      content={t('Edit message')!}
    />
  );
};

export default EditAction;
