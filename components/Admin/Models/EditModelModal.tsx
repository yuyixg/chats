import { deleteModels, putModels } from '@/apis/adminService';
import { GetModelResult, PutModelParams } from '@/types/admin';
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
import { getModelConfigs, mergeModelConfigs } from '@/utils/model';

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
          hidden={!getModelConfigs(selected?.modelVersion, 'modelConfig')}
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
          hidden={!getModelConfigs(selected?.modelVersion, 'fileConfig')}
          options={options}
          field={field}
        />
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
    fileConfig: z
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
      form.reset();
      form.formState.isValid;
      form.setValue('name', selected?.name);
      form.setValue('modelId', selected?.modelId);
      form.setValue('enabled', selected?.enabled);
      form.setValue(
        'apiConfig',
        mergeModelConfigs(
          getModelConfigs(selected!.modelVersion, 'apiConfig'),
          JSON.parse(selected?.apiConfig || '{}')
        )
      );
      form.setValue(
        'modelConfig',
        mergeModelConfigs(
          getModelConfigs(selected!.modelVersion, 'modelConfig'),
          JSON.parse(selected?.modelConfig || '{}')
        )
      );
      form.setValue(
        'fileConfig',
        mergeModelConfigs(
          getModelConfigs(selected!.modelVersion, 'fileConfig'),
          JSON.parse(selected?.fileConfig || '{}')
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
