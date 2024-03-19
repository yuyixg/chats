import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import { Textarea } from '../textarea';
import { FormFieldType, IFormFieldOption } from './type';

const FormTextarea = ({
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
