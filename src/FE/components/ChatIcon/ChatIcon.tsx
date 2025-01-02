import useTranslation from '@/hooks/useTranslation';

import { feModelProviders } from '@/types/model';

import { cn } from '@/lib/utils';

interface Props {
  providerId: number;
  className?: string;
}

const ChatIcon = (props: Props) => {
  const { providerId, className } = props;
  const { t } = useTranslation();

  if (providerId === undefined) return null;

  return (
    <img
      key={`img-${providerId}`}
      src={feModelProviders[providerId].icon}
      alt={t(feModelProviders[providerId].name)}
      style={{ background: 'transparent' }}
      className={cn('h-5 w-5 rounded-md', className)}
    />
  );
};
export default ChatIcon;
