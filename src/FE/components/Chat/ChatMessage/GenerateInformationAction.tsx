import { useTranslation } from 'next-i18next';

import { formatNumberAsMoney } from '@/utils/common';

import { PropsMessage } from '@/types/components/chat';

import { IconInfo } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Props {
  hidden?: boolean;
  message: PropsMessage;
}

export const GenerateInformationAction = (props: Props) => {
  const { t } = useTranslation('chat');
  const { message, hidden } = props;

  const GenerateInformation = (props: { name: string; value: string }) => {
    const { name, value } = props;
    return (
      <Label key={name} className="text-xs">
        {t(name)}
        {': '}
        {value}
      </Label>
    );
  };

  const Render = () => {
    return (
      <Tips
        className="h-[28px]"
        trigger={
          <Button variant="ghost" className="p-1 m-0 h-auto">
            <IconInfo stroke="#7d7d7d" />
          </Button>
        }
        content={
          <div className="w-50">
            <div className="grid gap-4">
              <div className="pt-1 pb-2">
                <Label className="font-medium">
                  {t('Generate information')}
                </Label>
              </div>
            </div>
            <div className="grid">
              <div className="grid grid-cols-1 items-center">
                <GenerateInformation
                  name={'duration'}
                  value={message?.duration.toLocaleString() + 'ms'}
                />
                <GenerateInformation
                  name={'prompt_tokens'}
                  value={`${message.inputTokens}`}
                />
                <GenerateInformation
                  name={'response_tokens'}
                  value={`${message.outputTokens}`}
                />
                <GenerateInformation
                  name={'total_tokens'}
                  value={`${message.inputTokens + message.outputTokens}`}
                />
                <GenerateInformation
                  name={'speed'}
                  value={
                    message?.duration
                      ? (
                          (message.outputTokens / (message?.duration || 0)) *
                          1000
                        ).toFixed(2) + ' tokens/s'
                      : '-'
                  }
                />
                <GenerateInformation
                  name={'prompt_price'}
                  value={'￥' + formatNumberAsMoney(+message.inputPrice, 6)}
                />
                <GenerateInformation
                  name={'response_price'}
                  value={'￥' + formatNumberAsMoney(+message.outputPrice, 6)}
                />
                <GenerateInformation
                  name={'total_price'}
                  value={
                    '￥' +
                    formatNumberAsMoney(
                      +message.inputPrice + +message.outputPrice,
                      6,
                    )
                  }
                />
              </div>
            </div>
          </div>
        }
      />
    );
  };

  return <>{!hidden && Render()}</>;
};

export default GenerateInformationAction;
