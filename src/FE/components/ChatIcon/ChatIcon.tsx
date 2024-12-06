
import { IconShare } from '@/components/Icons';
import useTranslation from '@/hooks/useTranslation';

import { cn } from '@/lib/utils';
import { feModelProviders } from '@/types/model';

interface Props {
  providerId: number;
  className?: string;
  isShard?: boolean;
}

const ChatIcon = (props: Props) => {
  const { providerId, isShard, className } = props;
  const { t } = useTranslation();

  return (
    <div className="flex">
      <img
        key={`img-${providerId}`}
        src={feModelProviders[providerId].icon}
        alt={t(feModelProviders[providerId].name)}
        style={{ background: 'transparent' }}
        className={cn('h-5 w-5 rounded-md dark:bg-white', className)}
      />
      {isShard && (
        <span className="w-2 h-2 absolute top-[22px] left-[21px]">
          <IconShare stroke={'hsl(var(--primary))'} className="w-2 h-2" />
        </span>
      )}
    </div>
  );
};
export default ChatIcon;
