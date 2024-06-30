import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { saveUserInfo, setUserSession } from '@/utils/user';

import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';

import { Card, CardContent } from '../ui/card';
import FormInput from '../ui/form/input';
import { FormFieldType, IFormFieldOption } from '../ui/form/type';

import { singIn } from '@/apis/userService';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const AccountLoginCard = (props: {
  loginLoading: boolean;
  openLoading: Function;
  closeLoading: Function;
}) => {
  const { loginLoading, openLoading, closeLoading } = props;
  const { t } = useTranslation('login');
  const router = useRouter();

  useEffect(() => {
    form.formState.isValid;
  }, []);

  const formFields: IFormFieldOption[] = [
    {
      name: 'username',
      label: t('Your username'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput autocomplete="on" options={options} field={field} />
      ),
    },
    {
      name: 'password',
      label: t('Your password'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput
          autocomplete="on"
          type="password"
          options={options}
          field={field}
        />
      ),
    },
  ];

  const formSchema = z.object({
    username: z.string().min(1, `${t('Please enter you user name')}`),
    password: z.string().min(1, `${t('Please enter you password')}`),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, field) => {
      obj[field.name] = field.defaultValue;
      return obj;
    }, {}),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!form.formState.isValid) return;
    openLoading();
    const { username, password } = values;
    singIn({ username, password })
      .then((response) => {
        setUserSession(response.sessionId);
        saveUserInfo({
          canRecharge: response.canRecharge,
          role: response.role,
          username: response.username,
        });
        router.push('/');
      })
      .catch(() => {
        closeLoading();
        toast.error(t('Username or password incorrect'));
      });
  }

  return (
    <Card>
      <CardContent className="space-y-2">
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
            <div className="w-full flex justify-center">
              <Button className="w-full" disabled={loginLoading} type="submit">
                {loginLoading ? t('Logging in...') : t('Login to your account')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AccountLoginCard;
