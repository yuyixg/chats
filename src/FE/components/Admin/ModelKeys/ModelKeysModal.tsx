import React, { useEffect } from 'react';
import { set, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import {
  GetModelKeysResult,
  ModelProviderInitialConfig,
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
  const [initialConfig, setInitialConfig] = React.useState<ModelProviderInitialConfig>();

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
    defaultValues: {
      modelProviderId: "0",
      name: '',
      host: '',
      secret: '',
    },
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

  const reloadInitialConfig = async () => {
    const modelProviderId = parseInt(form.getValues().modelProviderId || "0");
    getModelProviderInitialConfig(modelProviderId).then(initialConfig => {
      setInitialConfig(initialConfig);
    });
  }

  useEffect(() => {
    form.setValue('host', initialConfig?.initialHost || undefined);
    form.setValue('secret', initialConfig?.initialSecret || undefined);
  }, [initialConfig]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'modelProviderId' && type === 'change') {
        reloadInitialConfig();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    reloadInitialConfig();
  }, [selected]);

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
            <FormField key="name" control={form.control} name="name" render={({ field }) => (
              <FormInput label={t('Name')} field={field} />
            )} />
            <FormField key="modelProviderId" control={form.control} name="modelProviderId" render={({ field }) => (
              <FormSelect
                label={t('Model Provider')}
                disabled={!!selected}
                field={field}
                items={feModelProviders.map(p => ({ value: p.id.toString(), name: p.name }))}
              />
            )} />
            {initialConfig?.initialHost !== null && (
              <FormField key="host" control={form.control} name="host" render={({ field }) => (
                <FormInput label={t('Host')} field={field} />
              )} />)}
            {initialConfig?.initialSecret !== null && (
              <FormField key="secret" control={form.control} name="secret" render={({ field }) => (
                <FormTextarea rows={2} label={t('Secret')} field={field} />
              )} />)}
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
