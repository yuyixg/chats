import useTranslation from '@/hooks/useTranslation';

import { AdminModelDto } from '@/types/adminApis';

import ChangeChatModelDropdownMenu from '@/components/ChangeModel/ChangeModel';
import Tips from '@/components/Tips/Tips';

interface Props {
  models: AdminModelDto[];
  readonly?: boolean;
  showRegenerate?: boolean;
  onChangeModel: (model: AdminModelDto) => void;
  modelId: number;
  modelName: string;
  modelProviderId?: number;
}

export const ChangeModelAction = (props: Props) => {
  const { t } = useTranslation();
  const {
    models,
    modelId,
    modelName,
    modelProviderId,
    readonly,
    showRegenerate,
    onChangeModel,
  } = props;

  return (
    <Tips
      trigger={
        <ChangeChatModelDropdownMenu
          models={models}
          readonly={readonly}
          onChangeModel={(model) => {
            onChangeModel && onChangeModel(model);
          }}
          modelId={modelId}
          modelName={modelName}
          modelProviderId={modelProviderId}
          showRegenerate={showRegenerate}
          content={modelName}
        />
      }
      content={t('Change Model')!}
    />
  );
};

export default ChangeModelAction;
