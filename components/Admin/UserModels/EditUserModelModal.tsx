import { putUserModel } from '@/apis/adminService';
import { GetUserModelResult } from '@/types/admin';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FormFieldType, IFormFieldOption } from '../../ui/form/type';
import FormInput from '../../ui/form/input';
import FormSwitch from '../../ui/form/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Form, FormField } from '../../ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../ui/button';
import FormCalendar from '../../ui/form/calendar';

interface IProps {
  isOpen: boolean;
  selectedModelId: string;
  selectedUserModel: GetUserModelResult | null;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const EditUserModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, selectedUserModel, selectedModelId, onClose, onSuccessful } =
    props;
  const [submit, setSubmit] = useState(false);
  const formFields: IFormFieldOption[] = [
    {
      name: 'modelId',
      label: t('ID'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput hidden options={options} field={field} />
      ),
    },
    {
      name: 'modelName',
      label: t('Model Display Name'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput disabled options={options} field={field} />
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
      name: 'tokens',
      label: t('Remaining Tokens'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput type='number' options={options} field={field} />
      ),
    },
    {
      name: 'counts',
      label: t('Remaining Counts'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput type='number' options={options} field={field} />
      ),
    },
    {
      name: 'expires',
      label: t('Expiration Time'),
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormCalendar options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    modelName: z.string().optional(),
    modelId: z.string().optional(),
    enabled: z.boolean().optional(),
    tokens: z.union([z.string(), z.null(), z.number()]),
    counts: z.union([z.string(), z.null(), z.number()]),
    expires: z.union([z.string(), z.null(), z.date()]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, current) => {
      obj[current.name] = current.defaultValue;
      return obj;
    }, {}),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.formState.isValid;
      const model = selectedUserModel?.models.find(
        (x) => x.modelId === selectedModelId
      )!;
      form.setValue('modelId', model?.modelId);
      form.setValue('modelName', model?.modelName);
      form.setValue('enabled', model?.enabled);
      form.setValue('tokens', model?.tokens || null);
      form.setValue('counts', model?.counts || null);
      form.setValue('expires', model?.expires || null);
    }
  }, [isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSubmit(true);
    const models = selectedUserModel?.models.map((x) => {
      if (x.modelId === values?.modelId) {
        x.tokens = Number(values.tokens) || null;
        x.counts = Number(values.counts) || null;
        x.expires = values.expires
          ? new Date(values.expires).toLocaleDateString()
          : null;
        x.enabled = values.enabled;
      }
      return x;
    });
    putUserModel({
      userModelId: selectedUserModel?.userModelId!,
      models: models!,
    })
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
      })
      .finally(() => {
        setSubmit(false);
      });
  };

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
              <Button disabled={submit} type='submit'>
                {t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
