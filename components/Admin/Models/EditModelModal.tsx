import { getFileServices, getModelKeys, putModels } from '@/apis/adminService';
import {
  GetFileServicesResult,
  GetModelKeysResult,
  GetModelResult,
  PutModelParams,
} from '@/types/admin';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormField } from '../../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '../../ui/form/input';
import FormSwitch from '../../ui/form/switch';
import FormTextarea from '../../ui/form/textarea';
import { Button } from '../../ui/button';
import {
  ModelPriceUnit,
  conversionModelPriceToDisplay,
  getModelFileConfig,
  getModelModelConfig,
  getModelPriceConfig,
  mergeConfigs,
} from '@/utils/model';
import FormSelect from '@/components/ui/form/select';
import { formatNumberAsMoney } from '@/utils/common';
import { ModelProviders } from '@/types/model';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ModelProviderTemplates } from '@/types/template';

interface IProps {
  isOpen: boolean;
  selected: GetModelResult | null;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const EditModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, onClose, selected, onSuccessful } = props;
  const [fileServices, setFileServices] = useState<GetFileServicesResult[]>([]);
  const [modelKeys, setModelKeys] = useState<GetModelKeysResult[]>([]);

  const formSchema = z.object({
    modelProvider: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelVersion: z.string(),
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelId: z.string().optional(),
    isDefault: z.boolean().optional(),
    enabled: z.boolean().optional(),
    modelConfig: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelKeysId: z.string().nullable().default(null),
    fileServerId: z.string().nullable().default(null),
    fileConfig: z.string().nullable().default(null),
    priceConfig: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    remarks: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelProvider: '',
      modelVersion: '',
      name: '',
      isDefault: false,
      modelId: '',
      enabled: true,
      modelConfig: '',
      modelKeysId: '',
      fileServerId: '',
      fileConfig: '',
      priceConfig: '',
      remarks: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!form.formState.isValid) return;
    putModels(values as PutModelParams)
      .then(() => {
        onSuccessful();
        toast.success(t('Save successful!'));
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.'
          )
        );
      });
  }

  useEffect(() => {
    if (isOpen) {
      getFileServices(true).then((data) => {
        setFileServices(data);
      });
      getModelKeys().then((data) => {
        setModelKeys(data);
      });
      form.reset();
      form.formState.isValid;
      const {
        modelProvider,
        name,
        isDefault,
        modelId,
        modelVersion,
        enabled,
        remarks,
        modelKeysId,
        fileServerId,
        fileConfig,
        modelConfig,
        priceConfig,
      } = selected!;
      form.setValue('modelProvider', modelProvider);
      form.setValue('modelVersion', modelVersion);
      form.setValue('name', name);
      form.setValue('isDefault', isDefault);
      form.setValue('modelId', modelId);
      form.setValue('enabled', enabled);
      form.setValue('remarks', remarks);
      form.setValue('fileServerId', fileServerId || null);
      form.setValue('modelKeysId', modelKeysId || null);
      fileConfig &&
        form.setValue(
          'fileConfig',
          mergeConfigs(getModelFileConfig(modelVersion), JSON.parse(fileConfig))
        );
      form.setValue(
        'modelConfig',
        mergeConfigs(getModelModelConfig(modelVersion), JSON.parse(modelConfig))
      );
      form.setValue(
        'priceConfig',
        conversionModelPriceToDisplay(
          mergeConfigs(
            getModelPriceConfig(modelVersion),
            JSON.parse(priceConfig)
          )
        )
      );
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Edit Model')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='name'
                control={form.control}
                name='name'
                render={({ field }) => {
                  return (
                    <FormInput field={field} label={t('Model Display Name')!} />
                  );
                }}
              ></FormField>
              <FormField
                key='modelProvider'
                control={form.control}
                name='modelProvider'
                render={({ field }) => {
                  return (
                    <FormSelect
                      disabled
                      field={field}
                      label={t('Model Provider')!}
                      items={Object.keys(ModelProviderTemplates).map((key) => ({
                        name: ModelProviderTemplates[key as ModelProviders]
                          .displayName,
                        value: key,
                      }))}
                    />
                  );
                }}
              ></FormField>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='modelVersion'
                control={form.control}
                name='modelVersion'
                render={({ field }) => {
                  return (
                    <FormInput
                      disabled
                      field={field}
                      label={t('Model Version')!}
                    />
                  );
                }}
              ></FormField>
              <div className='flex justify-between'>
                <FormField
                  key='modelKeysId'
                  control={form.control}
                  name='modelKeysId'
                  render={({ field }) => {
                    return (
                      <FormSelect
                        className='w-full'
                        field={field}
                        label={t('Model Keys')!}
                        items={modelKeys
                          .filter(
                            (x) =>
                              x.type ===
                              (form.getValues(
                                'modelProvider'
                              ) as ModelProviders)
                          )
                          .map((keys) => ({
                            name: keys.name,
                            value: keys.id,
                          }))}
                      />
                    );
                  }}
                ></FormField>
                <div
                  hidden={!form.getValues('modelKeysId')}
                  className='text-sm mt-12 w-36 text-right'
                >
                  <Popover>
                    <PopoverTrigger>
                      <span className='text-primary'>
                        {t('Click View Configs')}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className='w-full'>
                      {JSON.stringify(
                        modelKeys.find(
                          (x) => x.id === form.getValues('modelKeysId')
                        )?.configs,
                        null,
                        2
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='modelConfig'
                control={form.control}
                name='modelConfig'
                render={({ field }) => {
                  return (
                    <FormTextarea
                      rows={7}
                      hidden={!getModelModelConfig(selected?.modelVersion)}
                      label={t('Model Configs')!}
                      field={field}
                    />
                  );
                }}
              ></FormField>
              <FormField
                key='priceConfig'
                control={form.control}
                name='priceConfig'
                render={({ field }) => {
                  return (
                    <FormTextarea
                      rows={7}
                      hidden={!getModelModelConfig(selected?.modelVersion)}
                      label={`${formatNumberAsMoney(ModelPriceUnit)} ${t(
                        'Token Price'
                      )}(${t('Yuan')})`}
                      field={field}
                    />
                  );
                }}
              ></FormField>
            </div>
            <div>
              <FormField
                key='fileServerId'
                control={form.control}
                name='fileServerId'
                render={({ field }) => {
                  return (
                    <FormSelect
                      field={field}
                      label={t('File Service Type')!}
                      hidden={!getModelFileConfig(selected?.modelVersion)}
                      items={fileServices.map((item) => ({
                        name: item.name,
                        value: item.id,
                      }))}
                    />
                  );
                }}
              ></FormField>
              <FormField
                key='fileConfig'
                control={form.control}
                name='fileConfig'
                render={({ field }) => {
                  return (
                    <FormTextarea
                      rows={4}
                      hidden={!getModelFileConfig(selected?.modelVersion)}
                      label={t('File Configs')!}
                      field={field}
                    />
                  );
                }}
              ></FormField>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='remarks'
                control={form.control}
                name='remarks'
                render={({ field }) => {
                  return <FormInput field={field} label={t('Remarks')!} />;
                }}
              ></FormField>
              <div className='flex gap-4'>
                <FormField
                  key={'isDefault'}
                  control={form.control}
                  name={'isDefault'}
                  render={({ field }) => {
                    return (
                      <FormSwitch
                        label={t('Provide new User')!}
                        field={field}
                      />
                    );
                  }}
                ></FormField>
                <FormField
                  key={'enabled'}
                  control={form.control}
                  name={'enabled'}
                  render={({ field }) => {
                    return (
                      <FormSwitch label={t('Is it enabled')!} field={field} />
                    );
                  }}
                ></FormField>
              </div>
            </div>
            <DialogFooter className='pt-4'>
              <Button type='submit'>{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
