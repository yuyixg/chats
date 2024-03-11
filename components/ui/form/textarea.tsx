import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import { Textarea } from '../textarea';
import { FormFieldType, IFormFieldOption } from './type';

const FormTextarea = ({
  options,
  field,
}: {
  options: IFormFieldOption;
  field: FormFieldType;
}) => {
  return (
    <FormItem className='py-2'>
      <FormLabel>{options.label}</FormLabel>
      <FormControl>
        <Textarea
          className='overflow-hidden'
          placeholder={options.placeholder}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default FormTextarea;
