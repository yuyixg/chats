import { deleteModels, getFileServers, putModels } from '@/apis/adminService';
import {
  GetFileServerResult,
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
import { FormFieldType, IFormFieldOption } from '../../ui/form/type';
import FormInput from '../../ui/form/input';
import FormSwitch from '../../ui/form/switch';
import FormTextarea from '../../ui/form/textarea';
import { Button } from '../../ui/button';
import {
  getModelApiConfig,
  getModelFileConfig,
  getModelModelConfig,
  getModelPriceConfig,
  mergeConfigs,
} from '@/utils/model';
import FormSelect from '@/components/ui/form/select';

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
  const [fileServers, setFileServers] = useState<GetFileServerResult[]>([]);
  const [deleting, setDeleting] = useState(false);
  const formFields: IFormFieldOption[] = [
    {
      name: 'name',
      label: t('Model Display Name'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'modelId',
      label: t('ID'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput hidden options={options} field={field} />
      ),
    },
    {
      name: 'enabled',
      label: t('Is it enabled'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSwitch options={options} field={field} />
      ),
    },
    {
      name: 'apiConfig',
      label: t('API Configs'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
    {
      name: 'modelConfig',
      label: t('Model Configs'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea
          hidden={!getModelModelConfig(selected?.modelVersion)}
          options={options}
          field={field}
        />
      ),
    },
    {
      name: 'fileServerId',
      label: t('File Server Type'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSelect
          hidden={!getModelFileConfig(selected?.modelVersion)}
          items={fileServers.map((item) => ({
            name: item.name,
            value: item.id,
          }))}
          options={options}
          field={field}
        />
      ),
    },
    {
      name: 'fileConfig',
      label: t('File Configs'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea
          hidden={!getModelFileConfig(selected?.modelVersion)}
          options={options}
          field={field}
        />
      ),
    },
    {
      name: 'price',
      label: t('Token Price'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelId: z.string().optional(),
    enabled: z.boolean().optional(),
    apiConfig: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    modelConfig: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    fileServerId: z.union([z.string(), z.undefined()]),
    fileConfig: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    price: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, field) => {
      obj[field.name] = field.defaultValue;
      return obj;
    }, {}),
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

  function onDelete() {
    setDeleting(true);
    deleteModels(form.getValues('modelId')!)
      .then(() => {
        onSuccessful();
        toast.success(t('Delete successful!'));
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.'
          )
        );
      })
      .finally(() => {
        setDeleting(false);
      });
  }

  useEffect(() => {
    if (isOpen) {
      getFileServers(true).then((data) => {
        setFileServers(data);
      });
      form.reset();
      form.formState.isValid;
      form.setValue('name', selected?.name);
      form.setValue('modelId', selected?.modelId);
      form.setValue('enabled', selected?.enabled);
      form.setValue('fileServerId', selected?.fileServerId);
      form.setValue(
        'apiConfig',
        mergeConfigs(
          getModelApiConfig(selected!.modelVersion),
          JSON.parse(selected?.apiConfig || '{}')
        )
      );
      form.setValue(
        'modelConfig',
        mergeConfigs(
          getModelModelConfig(selected!.modelVersion),
          JSON.parse(selected?.modelConfig || '{}')
        )
      );
      form.setValue(
        'fileConfig',
        mergeConfigs(
          getModelFileConfig(selected!.modelVersion),
          JSON.parse(selected?.fileConfig || '{}')
        )
      );
      form.setValue(
        'price',
        mergeConfigs(
          getModelPriceConfig(selected!.modelVersion),
          JSON.parse(selected?.price || '{}')
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
            {formFields.map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name as never}
                render={({ field }) => item.render(item, field)}
              />
            ))}
            <DialogFooter className='pt-4'>
              {/* <Button
                disabled={deleting}
                variant='destructive'
                onClick={onDelete}
              >
                {t('Delete')}
              </Button> */}
              <Button type='submit'>{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
