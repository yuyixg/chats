import { deleteModels, getFileServices, putModels } from '@/apis/adminService';
import {
  GetFileServicesResult,
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
  const [fileServices, setFileServices] = useState<GetFileServicesResult[]>([]);
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
          items={fileServices.map((item) => ({
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
      name: 'priceConfig',
      label: t('Token Price'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
    {
      name: 'remarks',
      label: t('Remarks'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
    {
      name: 'enabled',
      label: t('Is it enabled'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSwitch options={options} field={field} />
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
      getFileServices(true).then((data) => {
        setFileServices(data);
      });
      form.reset();
      form.formState.isValid;
      const {
        name,
        modelId,
        modelVersion,
        enabled,
        remarks,
        fileServerId,
        fileConfig,
        apiConfig,
        modelConfig,
        priceConfig,
      } = selected!;
      form.setValue('name', name);
      form.setValue('modelId', modelId);
      form.setValue('enabled', enabled);
      form.setValue('remarks', remarks);
      form.setValue('fileServerId', fileServerId || null);
      fileConfig &&
        form.setValue(
          'fileConfig',
          mergeConfigs(getModelFileConfig(modelVersion), JSON.parse(fileConfig))
        );
      form.setValue(
        'apiConfig',
        mergeConfigs(getModelApiConfig(modelVersion), JSON.parse(apiConfig))
      );
      form.setValue(
        'modelConfig',
        mergeConfigs(getModelModelConfig(modelVersion), JSON.parse(modelConfig))
      );
      form.setValue(
        'priceConfig',
        mergeConfigs(getModelPriceConfig(modelVersion), JSON.parse(priceConfig))
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
              {formFields.map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name as never}
                  render={({ field }) => item.render(item, field)}
                />
              ))}
            </div>
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
