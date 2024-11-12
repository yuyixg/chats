import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

type TypeValue = 'Default' | 'Custom';

interface Props {
  name: string;
  value: TypeValue;
  defaultValue?: number;
  maxValue?: number;
  step?: number;
  onChange: (value: TypeValue | number) => void;
  onValueChange: (value: number) => void;
}
const SliderSetting = (props: Props) => {
  const { name, value, defaultValue, maxValue, step, onChange, onValueChange } =
    props;
  const [finalValue, setFinalValue] = useState(defaultValue || 0);

  return (
    <div>
      <div className="flex justify-between py-2">
        <span className="text-base w-[70%]">{name}</span>
        <span
          className="text-base w-[30%] text-center text-gray-500"
          onClick={() => {
            onChange(value === 'Custom' ? 'Default' : finalValue);
          }}
        >
          {value}
        </span>
      </div>
      {value === 'Custom' && (
        <div className="flex py-1 gap-2">
          <Slider
            value={[finalValue || 0]}
            max={maxValue || 2}
            step={step || 0.1}
            className="w-[70%]"
            onValueChange={(values: number[]) => {
              setFinalValue(values[0]);
              onValueChange(values[0]);
            }}
          />
          <Input
            value={finalValue}
            type="number"
            className="no-spin-button text-center text-xs px-2 w-[30%] h-1 bg-[#ececec] dark:bg-[#262630] border-none outline-none"
          />
        </div>
      )}
    </div>
  );
};

export default SliderSetting;
