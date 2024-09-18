import { useTranslation } from 'next-i18next';

import { IconEdit } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';

interface Props {
  disabled: boolean;
  onToggleEditing: () => void;
}

const EditAction = (props: Props) => {
  const { onToggleEditing, disabled } = props;
  const { t } = useTranslation('client');

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
          <IconEdit stroke="#7d7d7d" />
        </Button>
      }
      content={t('Edit message')!}
    />
  );
};

export default EditAction;
