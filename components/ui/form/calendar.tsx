import { cn } from '@/lib/utils';
import { FormControl, FormItem, FormLabel, FormMessage } from '../form';
import { FormFieldType, IFormFieldOption } from './type';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Button } from '../button';
import { IconCalendar } from '@tabler/icons-react';
import { Calendar } from '../calendar';

const FormCalendar = ({
  options,
  field,
}: {
  options: IFormFieldOption;
  field: FormFieldType;
}) => {
  return (
    <FormItem className='py-2'>
      <FormLabel>{options.label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl className='flex'>
            <Button
              variant={'outline'}
              className={cn(
                'w-full pl-3 text-left font-normal',
                !field.value && 'text-muted-foreground'
              )}
            >
              {field.value ? (
                new Date(field.value).toLocaleDateString()
              ) : (
                <span></span>
              )}
              <IconCalendar className='ml-auto h-4 w-4 opacity-50' />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

export default FormCalendar;
