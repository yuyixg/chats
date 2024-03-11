import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { FormFieldType, IFormFieldOption } from './type';

const FormSelect = ({
  items,
  options,
  field,
}: {
  items: { name: string; value: string }[];
  options: IFormFieldOption;
  field: FormFieldType;
}) => {
  return (
    <FormItem className='py-2'>
      <FormLabel>{options.label}</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={options.placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {items!.map((item) => (
            <SelectItem value={item.value}>{item.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default FormSelect;
