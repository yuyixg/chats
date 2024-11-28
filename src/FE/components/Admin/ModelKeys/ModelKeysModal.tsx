import React, { useEffect } from 'react';
import { set, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import {
  AutoCreateModelResult,
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
  postAutoCreateModels,
  deleteModelKeys,
  getModelProviderInitialConfig,
  postModelKeys,
  putModelKeys,
} from '@/apis/adminApis';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { feModelProviders } from '@/types/model';
import Tips from '@/components/Tips/Tips';
import { IconInfo } from '@/components/Icons';
import { Label } from '@radix-ui/react-dropdown-menu';
import Spinner from '@/components/Spinner';

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
  const [loading, setLoading] = React.useState(false);

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

  const onSave = async (values: z.infer<typeof formSchema>): Promise<number | undefined> => {
    if (!form.formState.isValid) return undefined;

    const modelKeyDto: PostModelKeysParams = {
      modelProviderId: parseInt(values.modelProviderId),
      name: values.name,
      host: values.host || null,
      secret: values.secret || null,
    };

    try {
      const id = await handleModelKeyRequest();
      onSuccessful();
      return id;
    } catch {
      toast.error(
        t(
          'Operation failed! Please try again later, or contact technical personnel.',
        ),
      );
    }

    async function handleModelKeyRequest() {
      if (selected) {
        await putModelKeys(selected.id, modelKeyDto);
        return selected.id;
      } else {
        return await postModelKeys(modelKeyDto);
      }
    }
  }

  const autoCreateModels = async (modelKeyId: number) => {
    const result = await postAutoCreateModels(modelKeyId);
    const getMessage = (r: AutoCreateModelResult) => r.modelName + ': ' + (r.isCreated ? '✅' : '⚠️' + t(r.error!));
    const message = result.map(r => getMessage(r)).join('\n');
    if (result.some(r => r.isCreated)) {
      toast.success(`${t('Following models are auto created successfully:')}\n${message}`);
      onSuccessful();
    } else {
      toast.error(`${t('Failed to auto create models, reasons:')}\n${message}`);
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
        toast.error(t(resp.message));
      } catch {
        toast.error(t('Operation failed! Please try again later, or contact technical personnel.'));
      }
    }
  };

  const reloadInitialConfig = async (modelProviderId: number) => {
    setInitialConfig(await getModelProviderInitialConfig(modelProviderId));
  }

  useEffect(() => {
    if (selected) return;
    form.setValue('host', initialConfig?.initialHost || undefined);
    form.setValue('secret', initialConfig?.initialSecret || undefined);
  }, [initialConfig]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'modelProviderId' && type === 'change') {
        reloadInitialConfig(parseInt(form.getValues('modelProviderId') || '0'));
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
      reloadInitialConfig(selected?.modelProviderId || 0);
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
          <form onSubmit={form.handleSubmit(onSave)}>
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
            <DialogFooter className="pt-4 md:justify-between">
              <div>
                <Button type="button"
                  onClick={async () => {
                    const id = await onSave(form.getValues());
                    if (id) {
                      try {
                        setLoading(true);
                        await autoCreateModels(id);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                >
                  {t('Save and auto create all models')}
                  <Tips
                    side="bottom"
                    content={
                      <>
                        <Label>{t("Click this button to create all models that are not outdated")}</Label>
                        <Label>{t("Outdated models, such as gpt-3.5-turbo, will not be generated")}</Label>
                        <Label>{t("The model's display name is its official name, and the price is based on the database reference price")}</Label>
                        <Label>{t("If a model with the same name exists, it will not be altered")}</Label>
                        <Label>{t("Once all models are created, the system will notify you of the attempts and list successful creations")}</Label>
                      </>
                    }
                    trigger={
                      <Button variant="ghost" className="p-1 m-0 h-auto">
                        <IconInfo stroke="#7d7d7d" />
                      </Button>
                    }
                  />
                </Button>

              </div>
              <div className="flex gap-2">
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
              </div>
            </DialogFooter>
          </form>
        </Form>
        {loading && (
          <div
            className={`fixed top-0 left-0 bottom-0 right-0 bg-white dark:bg-[#202123] text-black/80 dark:text-white/80 z-50 text-center text-[12.5px]`}
          >
            <div className="fixed w-screen h-screen top-1/2">
              <div className="flex justify-center">
                <Spinner className="text-gray-500 dark:text-gray-50" />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
