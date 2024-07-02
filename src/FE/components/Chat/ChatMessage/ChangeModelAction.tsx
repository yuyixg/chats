import { useTranslation } from 'next-i18next';

import Tips from '@/components/Tips/Tips';

import ChangeModel from '../ChangeModel';

interface Props {
  hidden?: boolean;
  readonly?: boolean;
  onChangeModel: (modelId: string) => void;
  modelName: string;
}

export const ChangeModelAction = (props: Props) => {
  const { t } = useTranslation('chat');
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
            modelName={modelName!}
          />
        }
        content={t('Change Model')!}
      />
    );
  };

  return <>{!hidden && Render()}</>;
};

export default ChangeModelAction;
