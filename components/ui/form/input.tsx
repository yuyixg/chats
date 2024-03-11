import { Input } from '../input';
import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import { FormFieldType, IFormFieldOption } from './type';

const FormInput = ({
  options,
  field,
  hidden,
}: {
  options: IFormFieldOption;
  field: FormFieldType;
  hidden?: boolean;
}) => {
  return (
    <FormItem className='py-2' hidden={hidden}>
      <FormLabel>{options.label}</FormLabel>
      <FormControl>
        <Input placeholder={options.placeholder} {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default FormInput;
