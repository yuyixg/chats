import { useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { formatNumberAsMoney } from '@/utils/common';

import { ModelUsageDto } from '@/types/clientApis';

import { HomeContext } from '@/pages/home';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { getModelUsage } from '@/apis/clientApis';

export const ModelSelect = () => {
  const { t } = useTranslation();

  const {
    state: { selectModel, models },
    handleSelectModel,
  } = useContext(HomeContext);
  const [modelUsage, setModelUsage] = useState<ModelUsageDto>();

  useEffect(() => {
    if (selectModel) {
      getModelUsage(selectModel.modelId).then((res) => {
        setModelUsage(res);
      });
    }
  }, [selectModel]);

  const handleChange = (value: string) => {
    const model = models.find((m) => m.modelId.toString() == value);
    if (!model) return;

    handleSelectModel(model);
    getModelUsage(model.modelId).then((res) => {
      setModelUsage(res);
    });
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Model')}
      </label>
      <div className="w-full focus:outline-none active:outline-none rounded-lg border bg-background border-neutral-200 pr-2  dark:border-neutral-600">
        <Select
          onValueChange={handleChange}
          value={selectModel?.modelId?.toString()}
          defaultValue={selectModel?.modelId?.toString()}
        >
          <SelectTrigger className='focus:ring-0 focus:ring-offset-0 border-1'>
            <SelectValue placeholder={t('Select a model')} />
          </SelectTrigger>
          <SelectContent className='w-full'>
            {models.map((model) => (
              <SelectItem key={model.modelId} value={model.modelId.toString()}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {modelUsage && modelUsage.tokens === 0 && modelUsage.counts === 0 ? (
        <span className="text-xs pt-2">
          {t('unit-price')}: ￥{modelUsage.inputTokenPrice1M.toFixed(4)}/
          {modelUsage.outputTokenPrice1M.toFixed(4)} (1M tokens)
        </span>
      ) : (
        <>
          {modelUsage && (
            <div className="flex justify-between text-xs pt-1 text-muted-foreground">
              <div className="flex gap-4">
                {+modelUsage.counts > 0 ? (
                  <span>
                    {t('Remaining Chat Counts')}:&nbsp;{modelUsage.counts}
                  </span>
                ) : +modelUsage.tokens > 0 ? (
                  <span>
                    {t('Remaining Tokens')}:&nbsp;
                    {formatNumberAsMoney(+modelUsage.tokens)}
                  </span>
                ) : (
                  <span>
                    {t('unit-price')}: ￥
                    {modelUsage.inputTokenPrice1M.toFixed(4)}/
                    {modelUsage.outputTokenPrice1M.toFixed(4)} (1M tokens)
                  </span>
                )}
              </div>
              <div className="flex justify-end">
                {modelUsage.isTerm ? (
                  <></>
                ) : (
                  <>
                    {modelUsage.expires} {` ${t('become due')}`}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
