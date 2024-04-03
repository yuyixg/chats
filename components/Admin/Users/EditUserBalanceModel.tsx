import { putUserBalance } from '@/apis/adminService';
import { GetUsersResult } from '@/types/admin';
import { z } from 'zod';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Form, FormField } from '../../ui/form';
import { FormFieldType, IFormFieldOption } from '../../ui/form/type';
import FormInput from '../../ui/form/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../ui/button';

interface IProps {
  user?: GetUsersResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
}

export const EditUserBalanceModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { user, isOpen, onClose, onSuccessful } = props;
  const [loading, setLoading] = useState(false);
  const formFields: IFormFieldOption[] = [
    {
      name: 'value',
      label: `${t('Recharge Amount')}(${t('Unit')})`,
      defaultValue: 0,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput type='number' options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    value: z.coerce
      .number()
      .min(
        -9999,
        t('The recharge amount must be greater than {{count}}', {
          count: -9999,
        })!
      )
      .max(
        9999,
        t('The maximum recharge amount is {{count}}', { count: 9999 })!
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, field) => {
      obj[field.name] = field.defaultValue;
      return obj;
    }, {}),
  });

  useEffect(() => {
    form.reset();
    form.formState.isValid;
  }, [isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!form.formState.isValid) return;
    setLoading(true);
    putUserBalance({ userId: user!.id, value: values.value })
      .then(() => {
        toast.success(t('Recharged successfully'));
        onSuccessful();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('User recharge')}</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-muted-foreground'>
            {t('Current Balance')}: {(+user!.balance).toFixed(2)} {t('Unit')}
          </p>
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
                  {t('Confirm recharge')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
};
