import { Input } from '../input';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '../form';
import { FormFieldType, IFormFieldOption } from './type';
import { HTMLInputTypeAttribute } from 'react';

const FormInput = ({
  label,
  options,
  field,
  type,
  hidden,
  disabled,
}: {
  label?: string;
  options?: IFormFieldOption;
  field: FormFieldType;
  type?: HTMLInputTypeAttribute;
  hidden?: boolean;
  disabled?: boolean;
}) => {
  return (
    <FormItem className='py-2' hidden={hidden}>
      <FormLabel>{options?.label || label}</FormLabel>
      <FormControl>
        <Input
          disabled={disabled}
          type={type}
          placeholder={options?.placeholder}
          {...field}
        />
      </FormControl>
      <FormMessage />
      <FormDescription>{options?.description}</FormDescription>
    </FormItem>
  );
};

export default FormInput;
