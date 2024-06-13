import { ReactElement } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const ButtonToolTip = ({
  trigger,
  content,
  className,
}: {
  className?: string;
  trigger: ReactElement | string;
  content?: ReactElement | string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={true} className={className}>{trigger}</TooltipTrigger>
        {content && <TooltipContent>{content}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ButtonToolTip;
