import { HomeContext } from '@/pages/home/home';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useContext } from 'react';
import { IconChevronDown } from '../Icons';
import { Button } from '../ui/button';

const ChangeModel = ({
  readonly,
  modelName,
  onChangeModel,
}: {
  readonly: boolean;
  modelName: string;
  onChangeModel: (modelId: string) => void;
}) => {
  const {
    state: { models },
  } = useContext(HomeContext);

  return (
    <Popover>
      <PopoverTrigger className='flex' disabled={readonly}>
        <Button variant='ghost' className='p-1 m-0 h-auto'>
          <span className='text-[#7d7d7d] text-sm font-bold'>{modelName}</span>
          {!readonly && <IconChevronDown stroke='#7d7d7d' />}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className='grid grid-1 items-start'>
          {models.map((x) => (
            <Button
              variant='ghost'
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
