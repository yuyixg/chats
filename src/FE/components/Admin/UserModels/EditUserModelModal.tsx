import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { GetUserModelResult } from '@/types/admin';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import FormCalendar from '@/components/ui/form/calendar';
import FormInput from '@/components/ui/form/input';
import FormSwitch from '@/components/ui/form/switch';
import { FormFieldType, IFormFieldOption } from '@/components/ui/form/type';

import { putUserModel } from '@/apis/adminApis';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  const { isOpen, selectedUserModel, selectedModelId, onClose, onSuccessful } = props;
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
      description: t(
        "'-' Indicates unlimited, numbers indicate the number of times or quantities that can be used",
      )!,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'counts',
      label: t('Remaining Counts'),
      description: t(
        "'-' Indicates unlimited, numbers indicate the number of times or quantities that can be used",
      )!,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
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
    modelId: z.number(),
    enabled: z.boolean(),
    tokens: z.number(),
    counts: z.number(),
    expires: z.union([z.string(), z.date()]),
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
        (x) => x.modelId.toString() === selectedModelId,
      )!;
      form.setValue('modelId', model.modelId);
      form.setValue('modelName', model.modelName);
      form.setValue('enabled', model.enabled);
      form.setValue('tokens', model?.tokens);
      form.setValue('counts', model?.counts);
      form.setValue('expires', model?.expires);
    }
  }, [isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSubmit(true);
    const models = selectedUserModel?.models.map((x) => {
      if (x.modelId === values?.modelId) {
        x.tokens = values.tokens;
        x.counts = values.counts;
        x.expires = new Date(values.expires).toISOString();
        x.enabled = values.enabled;
      }
      return x;
    });
    putUserModel({ models: models! })
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
            <DialogFooter className="pt-4">
              <Button disabled={submit} type="submit">
                {t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
