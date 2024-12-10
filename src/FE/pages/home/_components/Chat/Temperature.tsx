import { FC, useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { Slider } from '@/components/ui/slider';

import { HomeContext } from '@/pages/home/_contents/Home.context';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  labelClassName?: string;
  defaultTemperature: number;
  min: number;
  max: number;
  onChangeTemperature: (temperature: number) => void;
}

export const TemperatureSlider: FC<Props> = ({
  label,
  labelClassName,
  defaultTemperature,
  min,
  max,
  onChangeTemperature,
}) => {
  const {
    state: {},
  } = useContext(HomeContext);
  const [temperature, setTemperature] = useState(defaultTemperature);
  const { t } = useTranslation();
  const handleChange = (value: number[]) => {
    const newValue = value[0];
    setTemperature(newValue);
    onChangeTemperature(newValue);
  };

  useEffect(() => {
    setTemperature(defaultTemperature);
  }, [defaultTemperature]);

  return (
    <div className="flex flex-col">
      <label
        className={cn(
          'mb-2 text-left text-neutral-700 dark:text-neutral-400',
          labelClassName,
        )}
      >
        {label}
      </label>
      <span className="text-[12px] text-black/50 dark:text-white/50 text-sm">
        {t(
          'Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.',
        )}
      </span>
      <span className="mt-2 mb-1 text-center text-neutral-900 dark:text-neutral-100">
        {temperature.toFixed(2)}
      </span>
      <Slider
        className="cursor-pointer"
        min={min}
        max={max}
        step={0.01}
        value={[temperature]}
        onValueChange={handleChange}
      />
      <ul className="mt-2 pb-8 flex justify-between px-[24px] text-sm">
        <li className="flex justify-center">
          <span className="absolute">{t('Precise')}</span>
        </li>
        <li className="flex justify-center">
          <span className="absolute">{t('Neutral')}</span>
        </li>
        <li className="flex justify-center">
          <span className="absolute">{t('Creative')}</span>
        </li>
      </ul>
    </div>
  );
};
