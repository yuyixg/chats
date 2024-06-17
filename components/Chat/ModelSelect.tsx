import { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { formatNumberAsMoney } from '@/utils/common';

import { ModelUsage } from '@/types/model';

import { HomeContext } from '@/pages/home/home';

import { getUserModelUsage } from '@/apis/userService';

export const ModelSelect = () => {
  const { t } = useTranslation('chat');

  const {
    state: { selectModelId, models },
    handleSelectModel,
  } = useContext(HomeContext);

  const [modelUsage, setModelUsage] = useState<ModelUsage | undefined>(
    models.find((x) => x.id === selectModelId)?.modelUsage,
  );

  useEffect(() => {
    getUserModelUsage(selectModelId!).then((data) => {
      setModelUsage(data);
    });
  }, [selectModelId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = models.find((m) => m.id == e.target.value)!;
    handleSelectModel(model.id);
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Model')}
      </label>
      <div className="w-full focus:outline-none active:outline-none rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          placeholder={t('Select a model') || ''}
          value={selectModelId}
          onChange={handleChange}
        >
          {models.map((model) => (
            <option
              key={model.id}
              value={model.id}
              className="dark:bg-[#262630] dark:text-white"
            >
              {model.name}
            </option>
          ))}
        </select>
      </div>
      {modelUsage &&
      (modelUsage.tokens === '-' || modelUsage.counts === '-') ? (
        <></>
      ) : (
        <>
          {modelUsage && (
            <div className="flex justify-between text-xs pt-1 text-muted-foreground">
              <div className="flex gap-4">
                {+modelUsage.counts > 0 && (
                  <span>
                    {t('Remaining Chat Counts')}:&nbsp;{modelUsage.counts}
                  </span>
                )}
                {+modelUsage.tokens > 0 && (
                  <span>
                    {t('Remaining Tokens')}:&nbsp;
                    {formatNumberAsMoney(+modelUsage.tokens)}
                  </span>
                )}
              </div>
              <div className="flex justify-end">
                {modelUsage.expires === '-' ? (
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
