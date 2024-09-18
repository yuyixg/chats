import { ReactElement } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ChatButtonToolTip = ({
  trigger,
  content,
}: {
  trigger: ReactElement | string;
  content: ReactElement | string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="h-[28px]">{trigger}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ChatButtonToolTip;
