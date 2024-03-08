import { putModels } from '@/apis/adminService';
import { GetModelResult } from '@/types/admin';

import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from '../ui/alert-dialog';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface IProps {
  isOpen: boolean;
  selectedModel: GetModelResult | null;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

interface FormField {
  type: 'input' | 'select';
}

export const EditModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, selectedModel, onClose, onSuccessful } = props;
  const [select, setSelect] = useState<GetModelResult>(selectedModel!);

  const formFields = {
    username: {
      defaultValue: '12345',
      type: 'input',
      name: 'username',
      label: t('Model Name'),
      placeholder: '',
      description: 'This is your public display name.',
      require: z.string().optional(),
    },
    type: {
      defaultValue: 'QianWen',
      type: 'select',
      name: 'type',
      label: t('Model Type'),
      placeholder: '',
      description: 'This is type.',
      require: z.string().optional(),
    },
  };
  const formSchema = z.object(
    Object.keys(formFields).reduce((result, key) => {
      result[key] = formFields[key].require;
      return result;
    }, {})
  );
  Object.keys(formFields);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.keys(formFields).reduce((result, key) => {
      result[key] = formFields[key].defaultValue;
      return result;
    }, {}),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(form.formState.isValid, values);
  }

  useEffect(() => {
    form.reset();
    isOpen && setSelect(selectedModel!);
  }, [isOpen]);

  const handleSave = () => {
    putModels(select)
      .then(() => {
        onSuccessful();
        toast.success(t('Save successful!'));
      })
      .catch(() => {
        toast.error(
          t(
            'Save failed! Please try again later, or contact technical personnel.'
          )
        );
      });
  };

  const onChange = (key: keyof GetModelResult, value: string | boolean) => {
    setSelect((prev) => {
      return { ...prev, [key]: value };
    });
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {Object.values(formFields).map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{item.label}</FormLabel>
                    <FormControl>
                      {item.type === 'input' ? (
                        <Input placeholder={item.placeholder} {...field} />
                      ) : (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={item.placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='GPT'>GPT</SelectItem>
                            <SelectItem value='QianWen'>QianWen</SelectItem>
                            <SelectItem value='QianFan'>QianFan</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormDescription>{item.description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <AlertDialogFooter>
              <AlertDialogCancel onClick={onClose}>
                {t('Close')}
              </AlertDialogCancel>
              <AlertDialogAction type='submit'>{t('Save')}</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
    // <Modal
    //   backdrop='transparent'
    //   placement='top'
    //   isOpen={isOpen}
    //   onClose={onClose}
    //   size='3xl'
    // >
    //   <ModalContent>
    //     {() => (
    //       <>
    //         <ModalHeader className='flex flex-col gap-1'>
    //           {t('Edit Model')} - {select?.modelId}
    //         </ModalHeader>
    //         <ModalBody>
    //           <div className='flex w-full justify-between items-center'>
    //             <Input
    //               type='text'
    //               label={`${t('Model Name')}`}
    //               labelPlacement={'outside'}
    //               placeholder={`${t('Enter your')} ${t('Model Name')}`}
    //               value={select?.name}
    //               onValueChange={(value) => {
    //                 onChange('name', value);
    //               }}
    //             />
    //             <Switch
    //               style={{ minWidth: '128px' }}
    //               className='pt-[24px] px-2'
    //               isSelected={select?.enable}
    //               size='sm'
    //               color='primary'
    //               onValueChange={(value) => {
    //                 onChange('enable', value);
    //               }}
    //             >
    //               {select?.enable ? t('Enabled') : t('Disabled')}
    //             </Switch>
    //           </div>
    //           <Textarea
    //             label={`${t('API Configs')}`}
    //             labelPlacement={'outside'}
    //             placeholder={`${t('Enter your')}${t('API Configs')}`}
    //             value={select?.apiConfig}
    //             onValueChange={(value) => {
    //               onChange('apiConfig', value);
    //             }}
    //           />
    //           <Textarea
    //             label={`${t('Model Configs')}`}
    //             labelPlacement={'outside'}
    //             placeholder={`${t('Enter your')}${t('Model Configs')}`}
    //             value={select?.modelConfig}
    //             onValueChange={(value) => {
    //               onChange('modelConfig', value);
    //             }}
    //           />
    //           <Textarea
    //             label={`${t('Image Configs')}`}
    //             labelPlacement={'outside'}
    //             placeholder={`${t('Enter your')}${t('Image Configs')}`}
    //             value={select?.imgConfig}
    //             onValueChange={(value) => {
    //               onChange('imgConfig', value);
    //             }}
    //           />
    //         </ModalBody>
    //         <ModalFooter>
    //           <Button color='primary' onClick={handleSave}>
    //             {t('Save')}
    //           </Button>
    //         </ModalFooter>
    //       </>
    //     )}
    //   </ModalContent>
    // </Modal>
  );
};
