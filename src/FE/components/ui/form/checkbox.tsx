import { Checkbox } from '../checkbox';
import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import { FormFieldType, IFormFieldOption } from './type';

const FormCheckbox = ({
  options,
  field,
}: {
  options: IFormFieldOption;
  field: FormFieldType;
}) => {
  return (
    <FormItem className="py-2 flex items-center gap-2">
      <FormControl className="flex">
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
      <FormLabel style={{ marginTop: 0 }}>{options.label}</FormLabel>
      <FormMessage />
    </FormItem>
  );
};

export default FormCheckbox;
