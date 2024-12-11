import useTranslation from '@/hooks/useTranslation';

import { AdminModelDto } from '@/types/adminApis';

import ChangeModel from '@/components/ChangeModel/ChangeModel';
import Tips from '@/components/Tips/Tips';

interface Props {
  models: AdminModelDto[];
  hidden?: boolean;
  readonly?: boolean;
  onChangeModel: (modelId: number) => void;
  modelName: string;
}

export const ChangeModelAction = (props: Props) => {
  const { t } = useTranslation();
  const { models, modelName, readonly, onChangeModel, hidden } = props;

  const Render = () => {
    return (
      <Tips
        trigger={
          <ChangeModel
            models={models}
            readonly={readonly}
            onChangeModel={(model) => {
              onChangeModel && onChangeModel(model.modelId);
            }}
            content={modelName}
          />
        }
        content={t('Change Model')!}
      />
    );
  };

  return <>{!hidden && Render()}</>;
};

export default ChangeModelAction;
