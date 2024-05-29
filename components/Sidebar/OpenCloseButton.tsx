import { IconMenu, IconX } from '@/components/Icons';

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
      className={`group fixed z-20 ${side === 'right' ? 'right-2' : 'left-2'}`}
      onClick={onClick}
      style={{ top: '10px' }}
    >
      <button className="pt-0 sm:pt-1">
        <span data-state="closed">
          <div className="flex h-[32px] w-8 items-center justify-center">
            {side === 'right' ? (
              <div className="flex h-6 w-6 flex-col items-center">
                <IconMenu className="text-black dark:text-white" />
              </div>
            ) : (
              <div className="flex h-6 w-6 flex-col items-center">
                <IconMenu className="text-black dark:text-white" />
              </div>
            )}
          </div>
        </span>
      </button>
    </div>
  );
};
