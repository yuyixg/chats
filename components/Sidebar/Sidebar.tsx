import { IconMistOff, IconPlus } from '@/components/Icons/index';
import { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import { CloseSidebarButton, OpenSidebarButton } from './OpenCloseButton';
import Search from '../Search';

interface Props<T> {
  isOpen: boolean;
  addItemButtonTitle: string;
  side: 'left' | 'right';
  items: T[];
  itemComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  handleDrop: (e: any) => void;
  hasModel: () => boolean;
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  footerComponent,
  searchTerm,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  hasModel,
}: Props<T>) => {
  const { t } = useTranslation('promptbar');

  return (
    <>
      <div
        className={`${
          isOpen ? 'w-[260px]' : 'w-0 hidden'
        } fixed top-0 ${side}-0 z-40 flex h-full flex-none flex-col space-y-2 text-black bg-[#f9f9f9] dark:bg-[#202123] dark:text-white p-2 text-[14px] sm:relative  sm:top-0`}
      >
        {hasModel() && (
          <div className='flex items-center'>
            <button
              className='flex w-full flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md p-3 text-black dark:text-white hover:bg-[#cdcdcd] hover:dark:bg-[#343541] bg-[#ececec] dark:bg-[#343541]/80'
              onClick={() => {
                handleCreateItem();
                handleSearchTerm('');
              }}
            >
              <IconPlus size={18} />
              {addItemButtonTitle}
            </button>
          </div>
        )}
        <Search
          placeholder={t('Search...') || ''}
          searchTerm={searchTerm}
          onSearch={handleSearchTerm}
        />

        <div className='flex-grow overflow-auto'>
          {items?.length > 0 ? (
            <div className='pt-2'>{itemComponent}</div>
          ) : (
            <div className='mt-8 select-none text-center opacity-50'>
              <IconMistOff className='mx-auto mb-3' />
              <span className='text-[14px] leading-normal'>{t('No data')}</span>
            </div>
          )}
        </div>
        {footerComponent}
        <CloseSidebarButton onClick={toggleOpen} side={side} />
      </div>

      {!isOpen && <OpenSidebarButton onClick={toggleOpen} side={side} />}
    </>
  );
};

export default Sidebar;
