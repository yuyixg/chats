import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import useTranslation from '@/hooks/useTranslation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import FormInput from '@/components/ui/form/input';
import FormTextarea from '@/components/ui/form/textarea';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompt';
import FormSwitch from '@/components/ui/form/switch';
import { HomeContext } from '@/pages/home';
import { UserRole } from '@/types/adminApis';
import { IconInfo } from '@/components/Icons';
import { PromptVariables } from '@/utils/promptVariable';
import Tips from '@/components/Tips/Tips';
import { TemperatureSlider } from '@/components/Chat/Temperature';


interface IProps {
  prompt: Prompt;
  onUpdatePrompt: (prompt: Prompt) => void;
  onClose: () => void;
}

export const PromptModal = (props: IProps) => {
  const { t } = useTranslation();
  const { prompt, onUpdatePrompt, onClose } = props;

  const {
    state: {
      user,
    },
  } = useContext(HomeContext);

  const formSchema = z.object({
    name: z.string().min(1, t('This field is require')),
    content: z.string().min(1, t('This field is require')),
    isDefault: z.boolean().optional(),
    isSystem: z.boolean().optional(),
    setsTemperature: z.boolean().default(false),
    temperature: z.number().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: prompt.name || '',
      content: prompt.content || '',
      isDefault: prompt.isDefault || false,
      isSystem: prompt.isSystem || false,
      setsTemperature: prompt.temperature !== null,
      temperature: prompt.temperature,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const updatedPrompt: Prompt = {
      ...prompt,
      name: values.name,
      content: values.content.trim(),
      isDefault: values.isDefault || false,
      isSystem: values.isSystem || false,
      temperature: values.setsTemperature ? values.temperature : null,
    };
    onUpdatePrompt(updatedPrompt);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Edit Prompt')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormInput label={t('Name')} field={field} />
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormTextarea label={(
                  <div className="mt-4 gap-1 text-sm flex align-middle items-center font-bold text-black dark:text-neutral-200">
                    {t('Prompt')}
                    <Tips
                      side='right'
                      trigger={
                        <Button type="button" className="w-auto h-auto" size="icon" variant="link">
                          <IconInfo size={18} />
                        </Button>
                      }
                      content={
                        <div className="text-xs font-normal">
                          <span className="font-semibold">{t('System Variables')}</span>
                          <div className="mt-2 flex-col">
                            {Object.keys(PromptVariables).map((key) => (
                              <p key={key}>
                                {key}:
                                {PromptVariables[key as keyof typeof PromptVariables]()}
                              </p>
                            ))}
                          </div>
                        </div>
                      }
                    />
                  </div>) as any as string
                } field={field} rows={10} />
              )}
            />
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormSwitch field={field} label={t('Is Default')} />
                )}
              />
              {user?.role === UserRole.admin && <FormField
                control={form.control}
                name="isSystem"
                render={({ field }) => (
                  <FormSwitch field={field} label={t('Is System')} />
                )}
              />}
              <FormField
                control={form.control}
                name="setsTemperature"
                render={({ field }) => (
                  <FormSwitch field={field} label={t('Sets Temperature')} />
                )}
              />
            </div>
            {form.getValues('setsTemperature') && <TemperatureSlider
              label={t('Temperature')}
              min={0}
              max={1}
              defaultTemperature={form.getValues('temperature') !== null ? form.getValues('temperature')! : 0.5}
              onChangeTemperature={(temperature) => form.setValue('temperature', temperature)}
            />}
            <div className="pt-4 text-right">
              <Button type="submit">{t('Save')}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};