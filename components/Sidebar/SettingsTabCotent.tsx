import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'next-i18next';
import { useTheme } from 'next-themes';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { getSettings, saveSettings } from '@/utils/settings';

import { Settings, Themes } from '@/types/settings';

import { HomeContext } from '@/pages/home/home';

import { Form, FormField } from '../ui/form';
import FormSelect from '../ui/form/select';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SettingsTabContent = () => {
  const { t } = useTranslation('settings');
  const settings: Settings = getSettings();
  const { state } = useCreateReducer<Settings>({
    initialState: settings,
  });

  const { dispatch: homeDispatch } = useContext(HomeContext);
  const formSchema = z.object({
    theme: z.string(),
    language: z.string(),
  });
  const { setTheme } = useTheme();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { theme: state.theme, language: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    homeDispatch({ field: 'theme', value: values.theme });
    homeDispatch({ field: 'language', value: values.language });
    saveSettings(values);
    setTheme(values.theme);
  };

  useEffect(() => {
    form.formState.isValid;
    form.reset();
    form.setValue('theme', state.theme);

    const subscription = form.watch((value, { name, type }) => {
      form.handleSubmit(onSubmit)();
    });
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between gap-4">
          <span>{t('Theme')!}</span>
          <FormField
            key="theme"
            control={form.control}
            name="theme"
            render={({ field }) => {
              return (
                <FormSelect
                  className="space-y-0 p-0 m-0"
                  items={Themes.map((value) => ({
                    name: t(value),
                    value,
                  }))}
                  field={field}
                />
              );
            }}
          />
        </div>
      </form>
    </Form>
  );
};

export default SettingsTabContent;
