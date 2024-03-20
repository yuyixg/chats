import { useContext } from 'react';
import { useTranslation } from 'next-i18next';
import { HomeContext } from '@/pages/home/home';

export const ModelSelect = () => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, models, defaultModelId },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = models.find((m) => m.modelId == e.target.value);
    selectedConversation &&
      handleUpdateConversation(selectedConversation, [
        {
          key: 'model',
          value: model,
        },
        {
          key: 'prompt',
          value: t(model!.systemPrompt),
        },
      ]);
  };

  return (
    <div className='flex flex-col'>
      <label className='mb-2 text-left text-neutral-700 dark:text-neutral-400'>
        {t('Model')}
      </label>
      <div className='w-full focus:outline-none active:outline-none rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white'>
        <select
          className='w-full bg-transparent p-2'
          placeholder={t('Select a model') || ''}
          value={selectedConversation?.model?.modelId || defaultModelId?.toString()}
          onChange={handleChange}
        >
          {models.map((model) => (
            <option
              key={model.modelId}
              value={model.modelId}
              className='dark:bg-[#343541] dark:text-white'
            >
              {model.modelId === defaultModelId
                ? `Default (${model.name})`
                : model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
