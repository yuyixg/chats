import useTranslation from '@/hooks/useTranslation';

import { IconRefresh } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';

interface Props {
  hidden?: boolean;
  onRegenerate?: () => void;
}

export const RegenerateAction = (props: Props) => {
  const { t } = useTranslation();
  const { onRegenerate, hidden } = props;

  const Render = () => {
    return (
      <Tips
        className="h-[28px]"
        trigger={
          <Button
            variant="ghost"
            className="p-1 m-0 h-auto"
            onClick={(e) => {
              onRegenerate && onRegenerate();
              e.stopPropagation();
            }}
          >
            <IconRefresh />
          </Button>
        }
        content={t('Regenerate')!}
      />
    );
  };

  return <>{!hidden && Render()}</>;
};

export default RegenerateAction;
