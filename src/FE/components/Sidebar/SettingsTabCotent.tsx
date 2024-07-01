import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'next-i18next';
import { useTheme } from 'next-themes';

import { DEFAULT_THEME, Themes } from '@/utils/settings';

import { HomeContext } from '@/pages/home/home';

import { Form, FormField } from '../ui/form';
import FormSelect from '../ui/form/select';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SettingsTabContent = () => {
  const { t } = useTranslation('settings');
  const { handleUpdateSettings } = useContext(HomeContext);
  const getStorageTheme = () => {
    return localStorage.getItem('theme') || DEFAULT_THEME;
  };

  const formSchema = z.object({
    theme: z.string(),
    language: z.string(),
  });
  const { setTheme } = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: getStorageTheme(),
      language: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleUpdateSettings('language', values.language);
    setTheme(values.theme);
  };

  useEffect(() => {
    form.formState.isValid;
    form.reset();
    form.setValue('theme', getStorageTheme());

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
