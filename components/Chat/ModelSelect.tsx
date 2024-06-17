import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Model } from '@/types/model';

import { HomeContext } from '@/pages/home/home';

export const ModelSelect = () => {
  const { t } = useTranslation('chat');

  const {
    state: { selectModelId, models },
    handleSelectModel,
  } = useContext(HomeContext);

  const [selectedModel, setSelectedModel] = useState<Model>(
    models.find((x) => x.id === selectModelId)!,
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = models.find((m) => m.id == e.target.value)!;
    setSelectedModel(model);
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
      <div className="flex gap-4 text-xs pt-1 text-muted-foreground">
        <span>
          {t('剩余Tokens')}: {selectedModel.modelUsage.tokens}
        </span>
        <span>
          {t('剩余聊天次数')}: {selectedModel.modelUsage.counts}
        </span>
        <span>
          {selectedModel.modelUsage.expires === '-'
            ? t('不限制使用')
            : selectedModel.modelUsage.expires + '到期'}
        </span>
      </div>
    </div>
  );
};
