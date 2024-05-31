import {
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconX,
} from '@/components/Icons';

import { Button } from '../ui/button';

interface Props {
  onClick: () => void;
  side: 'left' | 'right';
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  return (
    <div
      className={`group fixed z-20 sm:top-[8px] top-[4px] ${
        side === 'right' ? 'right-[260px]' : 'left-[260px]'
      }`}
      onClick={onClick}
    >
      <button>
        <div className="flex h-[32px] w-8 items-center justify-center">
          {side === 'right' ? (
            <div className="flex h-6 w-6 flex-col items-center">
              <IconX className="text-black dark:text-white" />
            </div>
          ) : (
            <div className="flex h-6 w-6 flex-col items-center">
              <IconX className="text-black dark:text-white" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

export const OpenSidebarButton = ({ onClick, side }: Props) => {
  return (
    <div
      className={`group fixed z-20 ${
        side === 'right' ? 'right-2' : 'left-[14px]'
      }`}
      onClick={onClick}
      style={{ top: '4px', zIndex: 9999999999999 }}
    >
      <button className="pt-1">
        <span data-state="closed">
          <div className="flex items-center justify-center">
            {side === 'right' ? (
              <div className="flex flex-col items-center">
                <Button variant="ghost">
                  <IconLayoutSidebarRight stroke="#7d7d7d" size={26} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Button variant="ghost" className="p-1 m-0 h-auto">
                  <IconLayoutSidebar stroke="#7d7d7d" size={26} />
                </Button>
              </div>
            )}
          </div>
        </span>
      </button>
    </div>
  );
};
