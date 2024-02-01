interface Props {
  onClick: () => void;
  side: 'left' | 'right';
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  return (
    <div
      className={`group fixed z-50  ${
        side === 'right' ? 'right-[260px]' : 'left-[260px]'
      }`}
      onClick={onClick}
      style={{ top: 'calc(50% - 72px)' }}
    >
      <button>
        <div className='flex h-[72px] w-8 items-center justify-center'>
          {side === 'right' ? (
            <div className='flex h-6 w-6 flex-col items-center'>
              <div className='group-hover:rotate-right group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform translate-y-[0.15rem] rotate-0'></div>
              <div className='group-hover:-rotate-right group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform -translate-y-[0.15rem] rotate-0'></div>
            </div>
          ) : (
            <div className='flex h-6 w-6 flex-col items-center'>
              <div className='group-hover:rotate-left group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform translate-y-[0.15rem] rotate-0'></div>
              <div className='group-hover:-rotate-left group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform -translate-y-[0.15rem] rotate-0'></div>
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
      className={`group fixed z-50 ${side === 'right' ? 'right-2' : 'left-2'}`}
      onClick={onClick}
      style={{ top: 'calc(50% - 72px)' }}
    >
      <button>
        <span data-state='closed'>
          <div className='flex h-[72px] w-8 items-center justify-center'>
            {side === 'right' ? (
              <div className='flex h-6 w-6 flex-col items-center'>
                <div className='group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform translate-y-[0.15rem] rotate-[15deg]'></div>
                <div className='group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform -translate-y-[0.15rem] -rotate-[15deg]'></div>
              </div>
            ) : (
              <div className='flex h-6 w-6 flex-col items-center'>
                <div className='group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform translate-y-[0.15rem] -rotate-[15deg]'></div>
                <div className='group-hover:bg-black h-3 w-1 rounded-full bg-gray-300 transform -translate-y-[0.15rem] rotate-[15deg]'></div>
              </div>
            )}
          </div>
        </span>
      </button>
    </div>
  );
};
