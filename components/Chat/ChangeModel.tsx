import { useContext } from 'react';

import { HomeContext } from '@/pages/home/home';

import { IconChevronDown } from '../Icons';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { cn } from '@/lib/utils';

const ChangeModel = ({
  readonly,
  modelName,
  className,
  onChangeModel,
}: {
  readonly?: boolean;
  modelName?: string;
  className?: string;
  onChangeModel: (modelId: string) => void;
}) => {
  const {
    state: { models },
  } = useContext(HomeContext);

  return (
    <Popover>
      <PopoverTrigger className="flex" disabled={readonly}>
        <Button variant="ghost" className="p-1 m-0 h-auto">
          <span className={cn('text-[#7d7d7d] font-medium', className)}>
            {modelName}
          </span>
          {!readonly && <IconChevronDown stroke="#7d7d7d" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid grid-1 items-start">
          {models.map((x) => (
            <Button
              variant="ghost"
              key={x.id}
              onClick={() => onChangeModel(x.id)}
            >
              {x.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ChangeModel;
