import { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { HomeContext } from '@/pages/home/home';

interface Props {
  label: string;
  defaultTemperature: number;
  onChangeTemperature: (temperature: number) => void;
}

export const TemperatureSlider: FC<Props> = ({
  label,
  defaultTemperature,
  onChangeTemperature,
}) => {
  const {
    state: {},
  } = useContext(HomeContext);
  const [temperature, setTemperature] = useState(defaultTemperature);
  const { t } = useTranslation('chat');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setTemperature(newValue);
    onChangeTemperature(newValue);
  };

  useEffect(() => {
    setTemperature(defaultTemperature);
  }, [defaultTemperature]);

  return (
    <div className='flex flex-col'>
      <label className='mb-2 text-left text-neutral-700 dark:text-neutral-400'>
        {label}
      </label>
      <span className='text-[12px] text-black/50 dark:text-white/50 text-sm'>
        {t(
          'Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.'
        )}
      </span>
      <span className='mt-2 mb-1 text-center text-neutral-900 dark:text-neutral-100'>
        {temperature.toFixed(1)}
      </span>
      <input
        className='cursor-pointer'
        type='range'
        min={0}
        max={1}
        step={0.1}
        value={temperature}
        onChange={handleChange}
      />
      <ul className='w mt-2 pb-8 flex justify-between px-[24px] text-neutral-900 dark:text-neutral-100'>
        <li className='flex justify-center'>
          <span className='absolute'>{t('Precise')}</span>
        </li>
        <li className='flex justify-center'>
          <span className='absolute'>{t('Neutral')}</span>
        </li>
        <li className='flex justify-center'>
          <span className='absolute'>{t('Creative')}</span>
        </li>
      </ul>
    </div>
  );
};
