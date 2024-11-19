import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import {
  GetModelKeysResult,
  PostModelKeysParams
} from '@/types/adminApis';

import FormSelect from '@/components/ui/form/select';

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
import FormTextarea from '@/components/ui/form/textarea';
import { FormFieldType, IFormFieldOption } from '@/components/ui/form/type';

import {
  deleteModelKeys,
  getModelProviderInitialConfig,
  postModelKeys,
  putModelKeys,
} from '@/apis/adminApis';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { feModelProviders } from '@/types/model';

interface IProps {
  selected: GetModelKeysResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const ModelKeysModal = (props: IProps) => {
  const { t } = useTranslation();
  const { selected, isOpen, onClose, onSuccessful } = props;
  const formFields: IFormFieldOption[] = [
    {
      name: 'name',
      label: t('Key Name'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'modelProviderId',
      label: t('Model Provider'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSelect
          disabled={!!selected}
          field={field}
          options={options}
          items={feModelProviders.map(p => {
            return {
              name: t(p.name),
              value: p.id.toString(),
            }
          })}
        />
      ),
    },
    {
      name: 'host',
      label: t('Host'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'secret',
      label: t('Secret'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea rows={2} options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    modelProviderId: z
      .string()
      .min(1, `${t('This field is require')}`)
      .default("0"),
    name: z
      .string()
      .min(1, `${t('This field is require')}`),
    host: z
      .string()
      .optional(),
    secret: z
      .string()
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

    const modelKeyDto: PostModelKeysParams = {
      modelProviderId: parseInt(values.modelProviderId),
      name: values.name,
      host: values.host || null,
      secret: values.secret || null,
    };

    handleModelKeyRequest().then(() => {
      onSuccessful();
      toast.success(t('Save successful!'));
    }).catch(() => {
      toast.error(
        t(
          'Operation failed! Please try again later, or contact technical personnel.',
        ),
      );
    });

    function handleModelKeyRequest() {
      if (selected) {
        return putModelKeys(selected.id, modelKeyDto);
      } else {
        return postModelKeys(modelKeyDto);
      }
    }
  }

  async function onDelete() {
    try {
      await deleteModelKeys(selected?.id!);
      onSuccessful();
      toast.success(t('Deleted successful!'));
    }
    catch (err: any) {
      try {
        const resp = await err.json();
        toast.error(resp.message);
      } catch {
        toast.error(t('Operation failed! Please try again later, or contact technical personnel.'));
      }
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'modelProviderId' && type === 'change') {
        const modelProviderId = parseInt(value.modelProviderId || "0");
        getModelProviderInitialConfig(modelProviderId).then((modelProvider) => {
          form.setValue('host', modelProvider.initialHost || undefined);
          form.setValue('secret', modelProvider.initialSecret || undefined);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.formState.isValid;
      if (selected) {
        const { name, modelProviderId, host, secret } = selected;
        form.setValue('name', name);
        form.setValue('modelProviderId', modelProviderId.toString());
        form.setValue('host', host || undefined);
        form.setValue('secret', secret || undefined);
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selected ? t('Edit Model Keys') : t('Add Model Keys')}
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
              {selected && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => {
                    onDelete();
                    e.preventDefault();
                  }}
                >
                  {t('Delete')}
                </Button>
              )}
              <Button type="submit">{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
