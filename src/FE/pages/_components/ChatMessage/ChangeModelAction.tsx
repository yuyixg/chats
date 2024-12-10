import useTranslation from '@/hooks/useTranslation';

import ChangeModel from '@/pages/_components/ChangeModel/ChangeModel';
import Tips from '@/pages/_components/Tips/Tips';

interface Props {
  hidden?: boolean;
  readonly?: boolean;
  onChangeModel: (modelId: number) => void;
  modelName: string;
}

export const ChangeModelAction = (props: Props) => {
  const { t } = useTranslation();
  const { modelName, readonly, onChangeModel, hidden } = props;

  const Render = () => {
    return (
      <Tips
        trigger={
          <ChangeModel
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
