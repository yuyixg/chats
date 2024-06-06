import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import {
  GetUserInitialConfigResult,
  ProviderType,
  UserInitialModel,
} from '@/types/user';

import { IconSquareRoundedX } from '@/components/Icons';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../../ui/dialog';
import { Form, FormControl, FormField } from '../../ui/form';
import FormInput from '../../ui/form/input';
import FormSelect from '../../ui/form/select';

import { getModels, postUserInitialConfig } from '@/apis/adminService';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';
import { z } from 'zod';

interface IProps {
  select?: GetUserInitialConfigResult;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
}
let ModelKeyMap = {} as any;
export const AddUserInitialConfigModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, select, onClose, onSuccessful } = props;
  const [submit, setSubmit] = useState(false);
  const [editModels, setEditModels] = useState<UserInitialModel[]>([]);

  const formSchema = z.object({
    name: z
      .string()
      .min(
        2,
        t('Must contain at least {{length}} character(s)', {
          length: 2,
        })!,
      )
      .max(50, t('Contain at most {{length}} character(s)', { length: 50 })!),
    price: z.union([z.string(), z.number()]).optional(),
    provider: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      provider: '-',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.formState.isValid;
      if (select) {
        form.setValue('name', select.name);
        form.setValue('price', `${select.price}` || 0);
        form.setValue('provider', select.provider);
      }
      setEditModels([]);
      getModels().then((data) => {
        const model = data.map((x) => {
          ModelKeyMap[x.modelId] = x.name;
          return {
            modelId: x.modelId,
            tokens: '-',
            counts: '-',
            expires: '-',
            enabled: false,
          };
        });
        setEditModels(model);
      });
    }
  }, [isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSubmit(true);
    const { name, provider, price } = values;
    postUserInitialConfig({
      name: name!,
      provider: provider!,
      price: new Decimal(price || 0),
      models: editModels.filter((x) => x.enabled),
    })
      .then(() => {
        toast.success(t('Save successful!'));
        onSuccessful();
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
      })
      .finally(() => {
        setSubmit(false);
      });
  };

  const onChangeModel = (
    index: number,
    type: 'tokens' | 'counts' | 'expires' | 'enabled',
    value: any,
  ) => {
    const _models = editModels as any;
    _models[index][type] = value;
    console.log(_models);
    setEditModels([..._models]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>{t('User Initial Config')}</DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormField
                  key="name"
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return <FormInput field={field} label={t('Name')!} />;
                  }}
                ></FormField>
                <FormField
                  key="price"
                  control={form.control}
                  name="price"
                  render={({ field }) => {
                    return (
                      <FormInput field={field} label={t('Initial Price')!} />
                    );
                  }}
                ></FormField>
                <FormField
                  key="provider"
                  control={form.control}
                  name="provider"
                  render={({ field }) => {
                    return (
                      <FormSelect
                        className="w-full"
                        field={field}
                        label={t('Provider')!}
                        items={[
                          { name: '-', value: '-' },
                          ...Object.keys(ProviderType).map((key) => ({
                            name: key,
                            value: key,
                          })),
                        ]}
                      />
                    );
                  }}
                ></FormField>
              </div>
              <div>
                <div className="flex">{t('Models')}</div>
                <div className="h-96 overflow-scroll flex justify-start gap-2 flex-wrap">
                  <Table>
                    <TableHeader>
                      <TableRow className="pointer-events-none">
                        <TableHead>{t('Model Display Name')}</TableHead>
                        <TableHead>{t('Tokens')}</TableHead>
                        <TableHead>{t('Counts')}</TableHead>
                        <TableHead>{t('Expiration Time')}</TableHead>
                        <TableHead>{t('Is Enabled')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editModels.map((model, index) => (
                        <TableRow key={model.modelId}>
                          <TableCell>{ModelKeyMap[model.modelId]}</TableCell>
                          <TableCell>
                            <Input
                              className="w-24"
                              value={model.tokens}
                              onChange={(e) => {
                                onChangeModel(index, 'tokens', e.target.value);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="w-24"
                              value={model.counts}
                              onChange={(e) => {
                                onChangeModel(index, 'counts', e.target.value);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl className="flex">
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'pl-3 text-left font-normal w-[132px]',
                                    )}
                                  >
                                    {model.expires ? (
                                      model.expires === '-' ? null : (
                                        new Date(
                                          model.expires,
                                        ).toLocaleDateString()
                                      )
                                    ) : (
                                      <span></span>
                                    )}
                                    <IconSquareRoundedX
                                      onClick={(e) => {
                                        onChangeModel(index, 'expires', '-');
                                        e.preventDefault();
                                      }}
                                      className="z-10 ml-auto h-5 w-5 opacity-50"
                                    />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={new Date(model.expires)}
                                  onSelect={(d) => {
                                    onChangeModel(
                                      index,
                                      'expires',
                                      d?.toLocaleDateString(),
                                    );
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={model.enabled}
                              onCheckedChange={(checked) => {
                                onChangeModel(index, 'enabled', checked);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button disabled={submit} type="submit">
                {t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
