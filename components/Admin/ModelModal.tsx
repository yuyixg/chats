import { putModels } from '@/apis/adminService';
import { GetModelResult, PutModelParams } from '@/types/admin';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormField } from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormFieldType, FormFields, IFormFieldOption } from '../ui/form/type';
import FormInput from '../ui/form/input';
import FormSwitch from '../ui/form/switch';
import FormTextarea from '../ui/form/textarea';
import { Button } from '../ui/button';

interface IProps {
  isOpen: boolean;
  selected: GetModelResult | null;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const ModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, onClose, selected, onSuccessful } = props;
  const formFields: FormFields = {
    name: {
      name: 'name',
      label: t('Model Name'),
      require: z
        .string()
        .min(1, `${t('Model Name')}${t('is require.')}`)
        .optional(),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    modelId: {
      name: 'modelId',
      label: t('ID'),
      require: z.string().optional(),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput hidden options={options} field={field} />
        // <FormSelect
        //   items={Object.keys(ModelType).map((key) => ({
        //     name: key,
        //     value: key,
        //   }))}
        //   options={options}
        //   field={field}
        // />
      ),
    },
    enable: {
      name: 'enable',
      label: t('Is it enabled'),
      require: z.boolean().optional(),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSwitch options={options} field={field} />
      ),
    },
    apiConfig: {
      name: 'apiConfig',
      label: t('API Configs'),
      require: z
        .string()
        .min(1, `${t('API Configs')}${t('is require.')}`)
        .optional(),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
    modelConfig: {
      name: 'modelConfig',
      label: t('Model Configs'),
      require: z
        .string()
        .min(1, `${t('Model Configs')}${t('is require.')}`)
        .optional(),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
    imgConfig: {
      name: 'imgConfig',
      label: t('Image Configs'),
      require: z
        .string()
        .min(1, `${t('Image Configs')}${t('is require.')}`)
        .optional(),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea options={options} field={field} />
      ),
    },
  };

  const formSchema = z.object(
    Object.keys(formFields).reduce((result: any, key) => {
      result[key] = formFields[key].require;
      return result;
    }, {})
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.keys(formFields).reduce((result: any, key) => {
      result[key] = formFields[key].defaultValue;
      return result;
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
            'Save failed! Please try again later, or contact technical personnel.'
          )
        );
      });
  }

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.setValue('name', selected?.name);
      form.setValue('modelId', selected?.modelId);
      form.setValue('enable', selected?.enable);
      form.setValue('apiConfig', selected?.apiConfig);
      form.setValue('modelConfig', selected?.modelConfig);
      form.setValue('imgConfig', selected?.imgConfig);
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
            {Object.values(formFields).map((item) => (
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
