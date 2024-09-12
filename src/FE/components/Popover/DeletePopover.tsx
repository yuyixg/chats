import { useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface Props {
  onDelete: () => void;
  onCancel?: () => void;
}
export default function DeletePopover(props: Props) {
  const { t } = useTranslation('sidebar');
  const { onDelete, onCancel } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = () => {
    setIsOpen(false);
    onCancel && onCancel();
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete && onDelete();
  };

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {t('Delete')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="pb-2">{t('Are you sure you want to delete it?')}</div>
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={handleCancel} variant="outline">
            {t('Cancel')}
          </Button>
          <Button size="sm" onClick={handleDelete}>
            {t('Confirm')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
