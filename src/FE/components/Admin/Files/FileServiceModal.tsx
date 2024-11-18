import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';
import { mergeConfigs } from '@/utils/model';

import { GetFileServicesResult, PostFileServicesParams, PutFileServicesParams } from '@/types/adminApis';
import { FileServicesType } from '@/types/file';

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
import FormSelect from '@/components/ui/form/select';
import FormSwitch from '@/components/ui/form/switch';
import FormTextarea from '@/components/ui/form/textarea';
import { FormFieldType, IFormFieldOption } from '@/components/ui/form/type';

import { defaultFileConfig, postFileService, putFileService } from '@/apis/adminApis';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface IProps {
  selected: GetFileServicesResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const FileServiceModal = (props: IProps) => {
  const { t } = useTranslation();
  const { selected, isOpen, onClose, onSuccessful } = props;
  const formFields: IFormFieldOption[] = [
    {
      name: 'type',
      label: t('File Service Type'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSelect
          items={Object.keys(FileServicesType).map((key) => ({
            name: FileServicesType[key as keyof typeof FileServicesType],
            value: FileServicesType[key as keyof typeof FileServicesType],
          }))}
          options={options}
          field={field}
        />
      ),
    },
    {
      name: 'name',
      label: t('Service Name'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'enabled',
      label: t('Is it enabled'),
      defaultValue: true,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSwitch options={options} field={field} />
      ),
    },
    {
      name: 'configs',
      label: t('Service Configs'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea rows={6} options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    type: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    enabled: z.boolean().optional(),
    configs: z
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
    let p = null;
    if (selected) {
      p = putFileService(selected.id, values as PutFileServicesParams);
    } else {
      p = postFileService(values as PostFileServicesParams);
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
        form.setValue('name', selected.name);
        form.setValue('type', selected.type);
        form.setValue('enabled', selected.enabled);
        form.setValue(
          'configs',
          mergeConfigs(defaultFileConfig, selected.configs),
        );
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'type' && type === 'change') {
        const type = value.type as FileServicesType;
        form.setValue(
          'configs',
          JSON.stringify(defaultFileConfig, null, 2),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selected ? t('Edit File Service') : t('Add File Service')}
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
