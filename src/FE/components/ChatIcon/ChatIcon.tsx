import Image from 'next/image';

import { ModelProviders } from '@/types/model';

import { IconShare } from '@/components/Icons';

import { cn } from '@/lib/utils';
import { LegacyModelProvider } from '@/types/admin';
import { useEffect, useState } from 'react';
import { getLegacyModelProviderByName } from '@/apis/adminApis';

interface Props {
  provider: ModelProviders;
  className?: string;
  isShard?: boolean;
}

const ChatIcon = (props: Props) => {
  const { provider, isShard, className } = props;
  const [modelProviderTemplate, setModelProviderTemplates] = useState<LegacyModelProvider>();

  useEffect(() => {
    getLegacyModelProviderByName(props.provider).then((data) => {
      setModelProviderTemplates(data);
    });
  })

  return modelProviderTemplate && (
    <div className="flex">
      <Image
        key={`img-${provider}`}
        src={`/logos/${modelProviderTemplate.icon}`}
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
