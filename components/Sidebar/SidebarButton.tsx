import { FC } from 'react';

interface Props {
  text: string;
  icon: JSX.Element;
  action?: JSX.Element;
  onClick: () => void;
}

export const SidebarButton: FC<Props> = ({ text, icon, action, onClick }) => {
  return (
    <button
      className='flex w-full justify-between select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10'
      onClick={onClick}
    >
      <div className='flex w-[80%] items-center'>
        <div>{icon}</div>
        <span className='px-3 whitespace-nowrap overflow-hidden text-ellipsis'>
          {text}
        </span>
      </div>
      <div>{action}</div>
    </button>
  );
};
