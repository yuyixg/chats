import { postModels } from '@/apis/adminService';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
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
import FormSelect from '@/components/ui/form/select';
import { ModelVersions } from '@/types/model';
import { PostModelParams } from '@/types/admin';
import { getModelConfigs } from '@/utils/model';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const AddModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, onClose, onSuccessful } = props;
  const formFields: IFormFieldOption[] = [
    {
      name: 'modelVersion',
      label: t('Model Version'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSelect
          items={Object.keys(ModelVersions).map((key) => ({
            name: ModelVersions[key as keyof typeof ModelVersions],
            value: ModelVersions[key as keyof typeof ModelVersions],
          }))}
          options={options}
          field={field}
        />
      ),
    },
    {
      name: 'name',
      label: t('Model Display Name'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'enable',
      label: t('Is it enabled'),
      defaultValue: true,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSwitch options={options} field={field} />
      ),
    },
    {
      name: 'apiConfig',
      label: t('API Configs'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
    {
      name: 'modelConfig',
      label: t('Model Configs'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea
          hidden={
            !getModelConfigs(
              form.getValues('modelVersion') as ModelVersions,
              'modelConfig'
            )
          }
          options={options}
          field={field}
        />
      ),
    },
    {
      name: 'fileConfig',
      label: t('File Configs'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea
          hidden={
            !getModelConfigs(
              form.getValues('modelVersion') as ModelVersions,
              'fileConfig'
            )
          }
          options={options}
          field={field}
        />
      ),
    },
  ];

  const formSchema = z.object({
    modelVersion: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    enable: z.boolean().optional(),
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
      form.reset();
      form.formState.isValid;
    }
  }, [isOpen]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'modelVersion' && type === 'change') {
        const modelVersion = value.modelVersion as ModelVersions;
        form.setValue(
          'apiConfig',
          JSON.stringify(getModelConfigs(modelVersion, 'apiConfig'), null, 2)
        );
        form.setValue(
          'modelConfig',
          JSON.stringify(getModelConfigs(modelVersion, 'modelConfig'), null, 2)
        );
        form.setValue(
          'fileConfig',
          JSON.stringify(getModelConfigs(modelVersion, 'fileConfig'), null, 2)
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Add Model')}</DialogTitle>
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
              <Button type='submit'>{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
