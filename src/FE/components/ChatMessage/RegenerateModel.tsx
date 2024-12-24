import useTranslation from '@/hooks/useTranslation';

import { IconRefresh } from '@/components/Icons';

import { Separator } from '../ui/separator';

interface Props {
  hidden?: boolean;
  modelName?: string;
  onRegenerate: (event: React.MouseEvent<Element, MouseEvent>) => any;
}

export const RegenerateModel = (props: Props) => {
  const { t } = useTranslation();
  const { modelName, hidden, onRegenerate } = props;

  const Render = () => {
    return (
      <>
        <Separator className="my-1" />
        <div
          className="flex my-1 justify-between p-2 gap-2 items-center text-sm rounded-md hover:bg-accent"
          onClick={onRegenerate}
        >
          <div className="flex flex-col">
            <span>{t('Regenerate')}</span>
            <span className="text-nowrap overflow-hidden text-ellipsis whitespace-nowrap">
              {modelName}
            </span>
          </div>
          <div>
            <IconRefresh
              size={18}
              stroke="hsl(var(--muted-foreground))"
              className="text-muted-foreground ml-[6px] "
            />
          </div>
        </div>
      </>
    );
  };

  return <>{!hidden && Render()}</>;
};

export default RegenerateModel;
