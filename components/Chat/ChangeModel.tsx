import { HomeContext } from '@/pages/home/home';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useContext } from 'react';
import { IconArrowsExchange } from '../Icons';

const ChangeModel = ({
  onChangeModel,
  modelName,
}: {
  modelName: string;
  onChangeModel: (modelId: string) => void;
}) => {
  const {
    state: { models },
  } = useContext(HomeContext);

  return (
    <Popover>
      <PopoverTrigger className='flex'>
        <IconArrowsExchange />
        {modelName}
      </PopoverTrigger>
      <PopoverContent>
        <div className='grid grid-1 items-center gap-4'>
          {models.map((x) => (
            <p key={x.id} onClick={() => onChangeModel(x.id)}>{x.name}</p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ChangeModel;
