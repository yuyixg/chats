import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { mergeConfigs } from '@/utils/model';

import {
  GetModelKeysResult,
  LegacyModelProvider,
  PostModelKeysParams,
  PutModelKeysParams,
} from '@/types/adminApis';
import { ModelProviders } from '@/types/model';

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
  postModelKeys,
  putModelKeys,
} from '@/apis/adminApis';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface IProps {
  selected: GetModelKeysResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
  modelProviderTemplates: { [name: string]: LegacyModelProvider };
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
      name: 'type',
      label: t('Model Provider'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSelect
          disabled={!!selected}
          field={field}
          options={options}
          items={Object.keys(props.modelProviderTemplates).map(providerKey => {
            const provider = props.modelProviderTemplates[providerKey];
            return {
              name: provider.displayName,
              value: provider.name,
            }
          })}
        />
      ),
    },
    {
      name: 'configs',
      label: t('Configs'),
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
      p = putModelKeys(selected.id, values as PutModelKeysParams);
    } else {
      p = postModelKeys(values as PostModelKeysParams);
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
      if (name === 'type' && type === 'change') {
        const modelProvider = value.type as ModelProviders;
        form.setValue(
          'configs',
          JSON.stringify(
            props.modelProviderTemplates[modelProvider].apiConfig,
            null,
            2,
          ),
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.formState.isValid;
      if (selected) {
        const { name, type, configs } = selected;
        form.setValue('name', name);
        form.setValue('type', type);
        form.setValue(
          'configs',
          mergeConfigs(
            props.modelProviderTemplates[type].apiConfig,
            configs,
          ),
        );
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
