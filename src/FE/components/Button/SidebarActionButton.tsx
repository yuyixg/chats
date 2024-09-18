import { MouseEventHandler, ReactElement } from 'react';

interface Props {
  handleClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactElement;
}

const SidebarActionButton = ({ handleClick, children }: Props) => (
  <button
    className="min-w-[20px] p-1 text-black dark:text-white hover:opacity-50"
    onClick={handleClick}
  >
    {children}
  </button>
);

export default SidebarActionButton;
