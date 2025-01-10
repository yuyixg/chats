import useTranslation from '@/hooks/useTranslation';

import { ReactionMessageType } from '@/types/chatMessage';

import { IconThumbDown } from '../Icons';
import Tips from '../Tips/Tips';
import { Button } from '../ui/button';

import { cn } from '@/lib/utils';

interface Props {
  hidden?: boolean;
  value: boolean | null;
  onReactionMessage: (type: ReactionMessageType) => void;
}

export const ReactionBadResponseAction = (props: Props) => {
  const { t } = useTranslation();
  const { hidden, value, onReactionMessage } = props;

  const Render = () => {
    return (
      <Tips
        trigger={
          <Button
            variant="ghost"
            className={cn('p-1 m-0 h-7 w-7', value === false && 'bg-muted')}
            onClick={(e) => {
              onReactionMessage(ReactionMessageType.Bad);
              e.stopPropagation();
            }}
          >
            <IconThumbDown />
          </Button>
        }
        side="bottom"
        content={t('Bad Response')!}
      />
    );
  };

  return <>{!hidden && Render()}</>;
};

export default ReactionBadResponseAction;
