import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { formatNumberAsMoney } from '@/utils/common';
import {
  ModelPriceUnit,
  conversionModelPriceToCreate,
  // getModelFileConfig,
  // getModelFileConfigJson,
  // getModelModelConfig,
  // getModelModelConfigJson,
  // getModelPriceConfigJson,
} from '@/utils/model';

import {
  GetFileServicesResult,
  GetModelKeysResult,
  LegacyModelProvider,
  LegacyModelReference,
  PostModelParams,
} from '@/types/admin';
import { ModelProviders, ModelVersions } from '@/types/model';
// import { ModelProviderTemplates } from '@/types/template';

import FormSelect from '@/components/ui/form/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import FormInput from '@/components/ui/form/input';
import FormSwitch from '@/components/ui/form/switch';
import FormTextarea from '@/components/ui/form/textarea';

import { getFileServices, getLegacyModelProviderByName, getLegacyModelReference, getModelKeys, postModels } from '@/apis/adminApis';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  const [modelReference, setModelReference] = useState<LegacyModelReference>();
  const { isOpen, onClose, onSuccessful } = props;
  const [loading, setLoading] = useState(true);

  const formSchema = z.object({
    modelVersion: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    enabled: z.boolean().optional(),
    modelConfig: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelKeysId: z.string().nullable().default(null),
    fileServiceId: z.string().nullable().default(null),
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
      modelVersion: '',
      name: '',
      enabled: true,
      modelConfig: '',
      modelKeysId: '',
      fileServiceId: null,
      fileConfig: '',
      priceConfig: '',
      remarks: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!form.formState.isValid) return;
    const modelProvider = modelKeys.find(
      (x) => x.id === parseInt(form.getValues('modelKeysId')!),
    )?.type;
    postModels({ ...values, modelProvider } as PostModelParams)
      .then(() => {
        onSuccessful();
        toast.success(t('Save successful!'));
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
      });
  }

  useEffect(() => {
    setLoading(true);
    if (isOpen) {
      getFileServices(true).then((data) => {
        setFileServices(data);
      });
      getModelKeys().then((data) => {
        setModelKeys(data);
        setLoading(false);
      });
      form.reset();
      form.formState.isValid;
    }
  }, [isOpen]);

  useEffect(() => {
    let subscription: any = null;
    if (!loading) {
      subscription = form.watch(async (value, { name, type }) => {
        if (name === 'modelKeysId' && type === 'change') {
          const modelKeysId = parseInt(value.modelKeysId!);
          console.log(typeof (modelKeysId), modelKeysId, modelKeys);
          const modelProviderName: ModelProviders = modelKeys.find(
            (x) => x.id === modelKeysId,
          )!.type;
          const modelProvider: LegacyModelProvider = await getLegacyModelProviderByName(modelProviderName);
          setModelVersions(modelProvider.models);
          form.setValue('modelVersion', '');
        }
        if (name === 'modelVersion' && type === 'change') {
          const modelVersion = value.modelVersion as ModelVersions;
          const modelKeysId = parseInt(value.modelKeysId!);
          const _modelProvider = modelKeys.find((x) => x.id === modelKeysId)
            ?.type!;
          getLegacyModelReference(_modelProvider, modelVersion).then(data => {
            setModelReference(data);
            form.setValue(
              'modelConfig',
              JSON.stringify(data.modelConfig),
            );
            form.setValue(
              'fileConfig',
              JSON.stringify(data.fileConfig),
            );
            form.setValue(
              'priceConfig',
              conversionModelPriceToCreate(data.priceConfig),
            );
          });
        }
      });
    }
    return () => subscription?.unsubscribe();
  }, [form.watch, loading]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-3/4">
        <DialogHeader>
          <DialogTitle>{t('Add Model')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                key="name"
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormInput field={field} label={t('Model Display Name')!} />
                  );
                }}
              ></FormField>
              <div className="flex justify-between">
                <FormField
                  key="modelKeysId"
                  control={form.control}
                  name="modelKeysId"
                  render={({ field }) => {
                    return (
                      <FormSelect
                        className="w-full"
                        field={field}
                        label={t('Model Keys')!}
                        items={modelKeys.map((keys) => ({
                          name: keys.name,
                          value: keys.id.toString(),
                        }))}
                      />
                    );
                  }}
                ></FormField>
                <div
                  hidden={!form.getValues('modelKeysId')}
                  className="text-sm w-36 mt-12 text-right"
                >
                  <Popover>
                    <PopoverTrigger>
                      <span className="text-primary">
                        {t('Click View Configs')}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-full">
                      {JSON.stringify(
                        modelKeys.find(
                          (x) => x.id === parseInt(form.getValues('modelKeysId')!),
                        )?.configs,
                        null,
                        2,
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div
              className="grid grid-cols-2 gap-4"
              key={form.getValues('modelKeysId')! || 'modelVersionKey'}
            >
              <FormField
                key="modelVersion"
                control={form.control}
                name="modelVersion"
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
              <FormField
                key="remarks"
                control={form.control}
                name="remarks"
                render={({ field }) => {
                  return <FormInput field={field} label={t('Remarks')!} />;
                }}
              ></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                key="modelConfig"
                control={form.control}
                name="modelConfig"
                render={({ field }) => {
                  return (
                    <FormTextarea
                      rows={7}
                      hidden={!modelReference}
                      label={t('Model Configs')!}
                      field={field}
                    />
                  );
                }}
              ></FormField>
              <FormField
                key="priceConfig"
                control={form.control}
                name="priceConfig"
                render={({ field }) => {
                  return (
                    <FormTextarea
                      rows={7}
                      hidden={!modelReference}
                      label={`${formatNumberAsMoney(ModelPriceUnit)} ${t(
                        'Token Price',
                      )}(${t('Yuan')})`}
                      field={field}
                    />
                  );
                }}
              ></FormField>
            </div>
            <div>
              <FormField
                key="fileServiceId"
                control={form.control}
                name="fileServiceId"
                render={({ field }) => {
                  return (
                    <FormSelect
                      field={field}
                      label={t('File Service Type')!}
                      hidden={!modelReference?.fileConfig}
                      items={fileServices.map((item) => ({
                        name: item.name,
                        value: item.id,
                      }))}
                    />
                  );
                }}
              ></FormField>
              <FormField
                key="fileConfig"
                control={form.control}
                name="fileConfig"
                render={({ field }) => {
                  return (
                    <FormTextarea
                      rows={4}
                      hidden={!modelReference?.fileConfig}
                      label={t('File Configs')!}
                      field={field}
                    />
                  );
                }}
              ></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-4">
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
            <DialogFooter className="pt-4">
              <Button type="submit">{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
