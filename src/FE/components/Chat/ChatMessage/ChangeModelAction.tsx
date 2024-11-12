import useTranslation from '@/hooks/useTranslation';

import ChangeModel from '@/components/Chat/ChangeModel';
import Tips from '@/components/Tips/Tips';

interface Props {
  hidden?: boolean;
  readonly?: boolean;
  onChangeModel: (modelId: string) => void;
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
              onChangeModel && onChangeModel(model.id);
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
