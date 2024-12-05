import { useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { formatNumberAsMoney } from '@/utils/common';

import { ModelUsageDto } from '@/types/clientApis';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { getModelUsage } from '@/apis/clientApis';
import { HomeContext } from '@/contexts/Home.context';

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

  const getTitle = () => {
    if (modelUsage) {
      if (modelUsage.tokens === 0 && modelUsage.counts === 0) {
        return t('unit-price');
      } else if (+modelUsage.counts > 0) {
        return t('Remaining Chat Counts');
      } else if (+modelUsage.tokens > 0) {
        return t('Remaining Tokens');
      } else {
        return t('unit-price');
      }
    }
    return '';
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {getTitle()}
      </label>
      {/* <div className="w-full focus:outline-none active:outline-none rounded-lg border bg-background border-neutral-200  dark:border-neutral-600">
        <Select
          onValueChange={handleChange}
          value={selectModel?.modelId?.toString()}
          defaultValue={selectModel?.modelId?.toString()}
        >
          <SelectTrigger className="border-1">
            <SelectValue placeholder={t('Select a model')} />
          </SelectTrigger>
          <SelectContent className="w-full">
            {models.map((model) => (
              <SelectItem key={model.modelId} value={model.modelId.toString()}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}
      {modelUsage && modelUsage.tokens === 0 && modelUsage.counts === 0 ? (
        <span className="text-xs pt-2">
          ￥{modelUsage.inputTokenPrice1M.toFixed(4)}/
          {modelUsage.outputTokenPrice1M.toFixed(4)} (1M tokens)
        </span>
      ) : (
        <>
          {modelUsage && (
            <div className="flex justify-between text-xs pt-1 text-muted-foreground">
              <div className="flex gap-4">
                {+modelUsage.counts > 0 ? (
                  <span>{modelUsage.counts}</span>
                ) : +modelUsage.tokens > 0 ? (
                  <span>{formatNumberAsMoney(+modelUsage.tokens)}</span>
                ) : (
                  <span>
                    ￥{modelUsage.inputTokenPrice1M.toFixed(4)}/
                    {modelUsage.outputTokenPrice1M.toFixed(4)} (1M tokens)
                  </span>
                )}
              </div>
              <div className="flex justify-end">
                {modelUsage.isTerm ? (
                  <></>
                ) : (
                  <>
                    {new Date(modelUsage.expires).toLocaleDateString()}{' '}
                    {` ${t('become due')}`}
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
