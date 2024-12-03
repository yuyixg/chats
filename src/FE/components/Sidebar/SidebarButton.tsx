import { FC } from 'react';

import { Button } from '@/components/ui/button';

interface Props {
  text: string;
  icon?: JSX.Element;
  className?: string;
  action?: JSX.Element;
  onClick: () => void;
}

export const SidebarButton: FC<Props> = ({
  text,
  icon,
  className,
  action,
  onClick,
}) => {
  return (
    <Button
      variant='ghost'
      className="flex w-full justify-between select-none items-center gap-2 rounded-md py-3 px-3 pl-[10px] text-[14px] leading-2 text-white transition-colors duration-200 hover:bg-gray-500/10 hover:dark:bg-[#262630]/90"
      onClick={onClick}
    >
      <div className="flex text-black dark:text-white w-[80%] items-center">
        <div>{icon}</div>
        <span
          className={`${
            icon && 'pl-3'
          } whitespace-nowrap text-ellipsis text-black dark:text-white ${className} ${
            text?.length >= 8 && 'overflow-hidden'
          }`}
        >
          {text}
        </span>
      </div>
      <div className="text-black dark:text-white">{action}</div>
    </Button>
  );
};
