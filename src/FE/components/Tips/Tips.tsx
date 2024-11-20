import { ReactElement, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Tips = ({
  trigger,
  content,
  className,
  side = 'top',
}: {
  className?: string;
  trigger: ReactElement | string;
  content?: ReactElement | string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <TooltipProvider>
      <Tooltip open={isOpen}>
        <TooltipTrigger
          asChild={true}
          className={className}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(true)}
        >
          {trigger}
        </TooltipTrigger>
        {content && <TooltipContent side={side}>{content}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export default Tips;
