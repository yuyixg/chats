import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import { Switch } from '../switch';
import { FormFieldType, IFormFieldOption } from './type';

const FormSwitch = ({
  options,
  field,
}: {
  options: IFormFieldOption;
  field: FormFieldType;
}) => {
  return (
    <FormItem className='py-2'>
      <FormLabel>{options.label}</FormLabel>
      <FormControl className='flex'>
        <Switch checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default FormSwitch;
