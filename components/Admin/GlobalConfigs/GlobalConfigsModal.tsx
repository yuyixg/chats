import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { GetConfigsResult, PostAndPutConfigParams } from '@/types/user';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Form, FormField } from '../../ui/form';
import FormInput from '../../ui/form/input';
import FormTextarea from '../../ui/form/textarea';
import { FormFieldType, IFormFieldOption } from '../../ui/form/type';

import { postConfigs, putConfigs } from '@/apis/adminService';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface IProps {
  selected: GetConfigsResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const GlobalConfigsModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { selected, isOpen, onClose, onSuccessful } = props;
  const formFields: IFormFieldOption[] = [
    {
      name: 'key',
      label: t('Key'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'value',
      label: t('Value'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea rows={6} options={options} field={field} />
      ),
    },
    {
      name: 'description',
      label: t('Description'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea rows={2} options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    key: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    value: z.string(),
    description: z.string(),
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
    let p = null;
    if (selected) {
      p = putConfigs({
        ...values,
      } as PostAndPutConfigParams);
    } else {
      p = postConfigs(values as PostAndPutConfigParams);
    }
    p.then(() => {
      onSuccessful();
      toast.success(t('Save successful!'));
    }).catch(() => {
      toast.error(
        t(
          'Operation failed! Please try again later, or contact technical personnel.',
        ),
      );
    });
  }

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.formState.isValid;
      if (selected) {
        form.setValue('key', selected.key);
        form.setValue('value', selected.value);
        form.setValue('description', selected.description);
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selected ? t('Edit Configs') : t('Add Configs')}
          </DialogTitle>
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
              <Button type="submit">{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
