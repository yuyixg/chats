import { IconSquareRoundedX } from '../Icons';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { cn } from '@/lib/utils';

interface Props {
  value?: string;
  onSelect: (date: Date) => void;
  onClear?: () => void;
}
export default function DateTimePopover(props: Props) {
  const { value, onSelect, onClear } = props;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('pl-3 text-left font-normal w-[150px]')}
        >
          {value ? (
            value === '-' ? null : (
              new Date(value).toLocaleDateString()
            )
          ) : (
            <span></span>
          )}
          {onClear && (
            <IconSquareRoundedX
              onClick={(e) => {
                onClear();
                e.preventDefault();
              }}
              className="z-10 ml-auto h-5 w-5 opacity-50"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(d) => {
            onSelect && onSelect(d!);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
