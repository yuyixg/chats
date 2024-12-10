import useTranslation from '@/hooks/useTranslation';

import Tips from '@/pages/_components/Tips/Tips';

import { IconEdit } from '@/components/Icons';
import { Button } from '@/components/ui/button';

interface Props {
  disabled: boolean;
  onToggleEditing: () => void;
}

const EditAction = (props: Props) => {
  const { onToggleEditing, disabled } = props;
  const { t } = useTranslation();

  return (
    <Tips
      className="h-[28px]"
      trigger={
        <Button
          variant="ghost"
          disabled={disabled}
          className="p-1 m-0 h-auto invisible group-hover:visible focus:visible"
          onClick={onToggleEditing}
        >
          <IconEdit />
        </Button>
      }
      content={t('Edit message')!}
    />
  );
};

export default EditAction;
