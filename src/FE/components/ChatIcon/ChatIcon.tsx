import Image from 'next/image';

import { ModelProviders } from '@/types/model';
import { ModelProviderTemplates } from '@/types/template';

import { IconShare } from '@/components/Icons';

import { cn } from '@/lib/utils';

interface Props {
  provider: ModelProviders;
  className?: string;
  isShard?: boolean;
}

const ChatIcon = (props: Props) => {
  const { provider, isShard, className } = props;
  return (
    <div className="flex">
      <Image
        key={`img-${provider}`}
        src={`/logos/${ModelProviderTemplates[provider].icon}`}
        alt={provider}
        width={18}
        height={18}
        style={{ background: 'transparent' }}
        className={cn('h-4 w-4 rounded-md dark:bg-white', className)}
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
