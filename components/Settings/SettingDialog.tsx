import { FC, useContext, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import { getSettings, saveSettings } from '@/utils/settings';
import { Languages, Settings, Themes } from '@/types/settings';
import { HomeContext } from '@/pages/home/home';
import { useTheme } from 'next-themes';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../ui/dialog';
import { Form, FormField } from '../ui/form';
import { Button } from '../ui/button';
import { FormFieldType, IFormFieldOption } from '../ui/form/type';
import FormSelect from '../ui/form/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingDialog: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('settings');
  const settings: Settings = getSettings();
  const { state } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const { setTheme } = useTheme();

  const formFields: IFormFieldOption[] = [
    {
      name: 'theme',
      label: t('Theme'),
      defaultValue: state.theme,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSelect
          items={Themes.map((value) => ({
            name: t(value),
            value,
          }))}
          options={options}
          field={field}
        />
      ),
    },
    {
      name: 'language',
      label: t('Language'),
      defaultValue: state.language,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormSelect
          hidden
          items={Languages.map((value) => {
            return {
              name: t(value),
              value,
            };
          })}
          options={options}
          field={field}
        />
      ),
    },
  ];

  const formSchema = z.object({
    theme: z.string(),
    language: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, field) => {
      obj[field.name] = field.defaultValue;
      return obj;
    }, {}),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    homeDispatch({ field: 'theme', value: values.theme });
    homeDispatch({ field: 'language', value: values.language });
    saveSettings(values);
    setTheme(values.theme);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      form.formState.isValid;
      form.reset();
      form.setValue('theme', state.theme);
      // form.setValue('language', state.language);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <DialogContent className='w-5/6 sm:w-4/5 lg:w-[650px]'>
          <DialogHeader>{t('Settings')}</DialogHeader>
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
              <DialogFooter className='pt-4'>
                <Button type='submit'>{t('Save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
};
