import { FC } from 'react';

interface Props {
  text: string;
  icon: JSX.Element;
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
    <button
      className='flex w-full justify-between select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-2 text-white transition-colors duration-200 hover:bg-gray-500/10'
      onClick={onClick}
    >
      <div className='flex w-[80%] items-center'>
        <div>{icon}</div>
        <span
          className={`px-3 whitespace-nowrap text-ellipsis ${className} ${
            text?.length >= 8 && 'overflow-hidden'
          }`}
        >
          {text}
        </span>
      </div>
      <div>{action}</div>
    </button>
  );
};
