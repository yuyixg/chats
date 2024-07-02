import { useTranslation } from 'next-i18next';

import { IconRefresh } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';

interface Props {
  hidden?: boolean;
  onRegenerate?: () => void;
}

export const RegenerateAction = (props: Props) => {
  const { t } = useTranslation('chat');
  const { onRegenerate, hidden } = props;

  const Render = () => {
    return (
      <Tips
        className="h-[28px]"
        trigger={
          <Button
            variant="ghost"
            className="p-1 m-0 h-auto"
            onClick={() => {
              onRegenerate && onRegenerate();
            }}
          >
            <IconRefresh stroke="#7d7d7d" />
          </Button>
        }
        content={t('Regenerate')!}
      />
    );
  };

  return <>{!hidden && Render()}</>;
};

export default RegenerateAction;
