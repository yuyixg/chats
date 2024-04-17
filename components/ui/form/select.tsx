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
  hidden,
  disabled,
}: {
  items: { name: string; value: string }[];
  options: IFormFieldOption;
  field: FormFieldType;
  hidden?: boolean;
  disabled?: boolean;
}) => {
  return (
    <FormItem className='py-2' hidden={hidden}>
      <FormLabel>{options.label}</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger disabled={disabled}>
            <SelectValue placeholder={options.placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {items!.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default FormSelect;
