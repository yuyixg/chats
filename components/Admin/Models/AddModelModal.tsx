import { getFileServices, getModelKeys, postModels } from '@/apis/adminService';
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
import FormSelect from '@/components/ui/form/select';
import { ModelProviders, ModelVersions } from '@/types/model';
import {
  GetFileServicesResult,
  GetModelKeysResult,
  PostModelParams,
} from '@/types/admin';
import {
  ModelPriceUnit,
  conversionModelPriceToDisplay,
  getModelFileConfig,
  getModelFileConfigJson,
  getModelModelConfig,
  getModelModelConfigJson,
  getModelPriceConfigJson,
} from '@/utils/model';
import { formatNumberAsMoney } from '@/utils/common';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ModelProviderTemplates } from '@/types/template';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const AddModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const [fileServices, setFileServices] = useState<GetFileServicesResult[]>([]);
  const [modelKeys, setModelKeys] = useState<GetModelKeysResult[]>([]);
  const [modelVersions, setModelVersions] = useState<ModelVersions[]>([]);
  const { isOpen, onClose, onSuccessful } = props;

  const formSchema = z.object({
    modelProvider: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelVersion: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
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
    postModels(values as PostModelParams)
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
    }
  }, [isOpen]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'modelProvider' && type === 'change') {
        const modelProvider = value.modelProvider as ModelProviders;
        setModelVersions(ModelProviderTemplates[modelProvider].models);
      }
      if (name === 'modelVersion' && type === 'change') {
        const modelVersion = value.modelVersion as ModelVersions;
        form.setValue('modelConfig', getModelModelConfigJson(modelVersion));
        form.setValue('fileConfig', getModelFileConfigJson(modelVersion));
        form.setValue(
          'priceConfig',
          conversionModelPriceToDisplay(getModelPriceConfigJson(modelVersion))
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-3/4'>
        <DialogHeader>
          <DialogTitle>{t('Add Model')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='modelProvider'
                control={form.control}
                name='modelProvider'
                render={({ field }) => {
                  return (
                    <FormSelect
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
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='modelVersion'
                control={form.control}
                name='modelVersion'
                render={({ field }) => {
                  return (
                    <FormSelect
                      field={field}
                      label={t('Model Version')!}
                      items={modelVersions.map((key) => ({
                        name: key,
                        value: key,
                      }))}
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
                  className='text-sm w-36 mt-12 text-right'
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
                      hidden={
                        !getModelModelConfig(
                          form.getValues('modelVersion') as ModelVersions
                        )
                      }
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
                      hidden={
                        !getModelModelConfig(
                          form.getValues('modelVersion') as ModelVersions
                        )
                      }
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
                      hidden={
                        !getModelFileConfig(
                          form.getValues('modelVersion') as ModelVersions
                        )
                      }
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
                      hidden={
                        !getModelFileConfig(
                          form.getValues('modelVersion') as ModelVersions
                        )
                      }
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
