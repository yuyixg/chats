import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { formatNumberAsMoney } from '@/utils/common';
import {
  ModelPriceUnit,
  conversionModelPriceToCreate,
  convertModelPriceToDisplay,
} from '@/utils/model';

import {
  GetFileServicesResult,
  GetModelKeysResult,
  ModelReferenceDto,
  SimpleModelReferenceDto,
  UpdateModelDto,
} from '@/types/adminApis';

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

import { getFileServices, getModelKeys, getModelProviderModels, getModelReference, postModels } from '@/apis/adminApis';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const AddModelModal = (props: IProps) => {
  const { t } = useTranslation();
  const [fileServices, setFileServices] = useState<GetFileServicesResult[]>([]);
  const [modelKeys, setModelKeys] = useState<GetModelKeysResult[]>([]);
  const [modelVersions, setModelVersions] = useState<SimpleModelReferenceDto[]>([]);
  const [modelReference, setModelReference] = useState<ModelReferenceDto>();
  const { isOpen, onClose, onSuccessful } = props;
  const [loading, setLoading] = useState(true);

  const formSchema = z.object({
    modelReferenceId: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    enabled: z.boolean().optional(),
    deploymentName: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelKeyId: z.string().nullable().default(null),
    fileServiceId: z.string().nullable().default(null),
    priceConfig: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    remarks: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelReferenceId: '',
      name: '',
      enabled: true,
      deploymentName: '',
      modelKeyId: '',
      fileServiceId: null,
      priceConfig: '',
      remarks: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!form.formState.isValid) return;
    const dto: UpdateModelDto = {
      name: values.name!,
      modelReferenceId: parseInt(values.modelReferenceId!),
      enabled: !!values.enabled,
      deploymentName: values.deploymentName || null,
      modelKeyId: parseInt(values.modelKeyId!),
      fileServiceId: values.fileServiceId,
      inputTokenPrice1M: JSON.parse(values.priceConfig!).input,
      outputTokenPrice1M: JSON.parse(values.priceConfig!).out,
    };
    postModels(dto)
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
        if (name === 'modelKeyId' && type === 'change') {
          const modelKeyId = parseInt(value.modelKeyId!);
          const modelProviderId = modelKeys.find((x) => x.id === modelKeyId)?.modelProviderId!;
          const possibleModels = await getModelProviderModels(modelProviderId);
          setModelVersions(possibleModels);
          form.setValue('modelReferenceId', possibleModels[0]?.id?.toString());
        }
        if (name === 'modelReferenceId' && type === 'change') {
          const modelReferenceId = parseInt(value.modelReferenceId!);
          const modelKeyId = parseInt(value.modelKeyId!);
          getModelReference(modelReferenceId).then(data => {
            setModelReference(data);
            form.setValue('priceConfig', convertModelPriceToDisplay(data.promptTokenPrice1M, data.responseTokenPrice1M));
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
                  key="modelKeyId"
                  control={form.control}
                  name="modelKeyId"
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
                  hidden={!form.getValues('modelKeyId')}
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
                          (x) => x.id === parseInt(form.getValues('modelKeyId')!),
                        )?.toConfigs(),
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
              key={form.getValues('modelKeyId')! || 'modelVersionKey'}
            >
              <FormField
                key="modelReferenceId"
                control={form.control}
                name="modelReferenceId"
                render={({ field }) => {
                  return (
                    <FormSelect
                      field={field}
                      label={t('Model Version')!}
                      items={modelVersions.map((key) => ({
                        name: key.name,
                        value: key.id.toString(),
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
                key="deploymentName"
                control={form.control}
                name="deploymentName"
                render={({ field }) => {
                  return (
                    <FormInput
                      hidden={!modelReference}
                      label={t('Deployment Name')!}
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
                      hidden={!modelReference?.allowVision}
                      items={fileServices.map((item) => ({
                        name: item.name,
                        value: item.id,
                      }))}
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
