import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormField } from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormFieldType, IFormFieldOption } from '../ui/form/type';
import FormTextarea from '../ui/form/textarea';
import { Button } from '../ui/button';
import { PostPromptParams, PutPromptParams } from '@/types/admin';
import FormInput from '../ui/form/input';
import {
  deleteUserPrompts,
  postUserPrompts,
  putUserPrompts,
} from '@/apis/userService';
import { Prompt } from '@/types/prompt';

interface IProps {
  selected: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const PromptsModal = (props: IProps) => {
  const { t } = useTranslation('prompt');
  const { selected, isOpen, onClose, onSuccessful } = props;
  const formFields: IFormFieldOption[] = [
    {
      name: 'name',
      label: t('Name'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'content',
      label: t('Content'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea rows={6} options={options} field={field} />
      ),
    },
    {
      name: 'description',
      label: t('Description'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormTextarea rows={3} options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    name: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    content: z
      .string()
      .min(1, `${t('This field is require')}`)
      .optional(),
    description: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, field) => {
      obj[field.name] = field.defaultValue;
      return obj;
    }, {}),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!form.formState.isValid) return;
    let p = null;
    if (selected) {
      p = putUserPrompts({
        ...values,
        id: selected.id,
      } as PutPromptParams);
    } else {
      p = postUserPrompts(values as PostPromptParams);
    }
    p.then(() => {
      onSuccessful();
      toast.success(t('Save successful!'));
    }).catch(() => {
      toast.error(
        t(
          'Operation failed! Please try again later, or contact technical personnel.'
        )
      );
    });
  }

  function onDelete() {
    deleteUserPrompts(selected?.id!).then(() => {
      onSuccessful();
      toast.success(t('Deleted successful!'));
    });
  }

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.formState.isValid;
      if (selected) {
        const { name, content, description } = selected;
        form.setValue('name', name);
        form.setValue('content', content);
        form.setValue('description', description);
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selected ? t('Edit Prompt') : t('Add Prompt')}
          </DialogTitle>
        </DialogHeader>
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
              {selected && (
                <Button
                  variant='destructive'
                  onClick={(e) => {
                    onDelete();
                    e.preventDefault();
                  }}
                >
                  {t('Delete')}
                </Button>
              )}
              <Button type='submit'>{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
