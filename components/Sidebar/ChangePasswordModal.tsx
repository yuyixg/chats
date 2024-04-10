import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FormFieldType, IFormFieldOption } from '../ui/form/type';
import FormInput from '../ui/form/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '../ui/form';
import toast from 'react-hot-toast';
import { changeUserPassword } from '@/apis/userService';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
}

export const ChangePasswordModal = (props: IProps) => {
  const { t } = useTranslation('sidebar');
  const { isOpen, onClose, onSuccessful } = props;
  const [loading, setLoading] = useState(false);

  const formFields: IFormFieldOption[] = [
    {
      name: 'password',
      label: t('New Password'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput type='password' options={options} field={field} />
      ),
    },
    {
      name: 'confirmPassword',
      label: t('Confirm Password'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput type='password' options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    password: z
      .string()
      .min(
        6,
        t('Must contain at least {{length}} character(s)', {
          length: 6,
        })!
      )
      .max(18, t('Contain at most {{length}} character(s)', { length: 18 })!),
    confirmPassword: z
      .string()
      .min(
        6,
        t('Must contain at least {{length}} character(s)', {
          length: 6,
        })!
      )
      .max(18, t('Contain at most {{length}} character(s)', { length: 18 })!),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, field) => {
      obj[field.name] = field.defaultValue;
      return obj;
    }, {}),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!form.formState.isValid) return;
    const { password, confirmPassword } = values;
    if (confirmPassword !== password) {
      toast.error(t('The two password inputs are inconsistent'));
      return;
    }
    setLoading(true);
    changeUserPassword(password)
      .then(() => {
        toast.success(t('Save successful!'));
        onSuccessful();
        setLoading(false);
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.'
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    form.formState.isValid;
    form.setValue('password', '');
    form.setValue('confirmPassword', '');
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-5/6 sm:w-4/5 lg:w-[650px]'>
        <DialogHeader>{t('Change Password')}</DialogHeader>
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
              <Button disabled={loading} type='submit'>
                {t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
