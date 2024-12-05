import { ReactNode } from 'react';

import useTranslation from '@/hooks/useTranslation';

import {
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconSearch,
  IconSquarePlus,
} from '@/components/Icons/index';
import Search from '@/components/Search';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface Props<T> {
  showOpenButton?: boolean;
  isOpen: boolean;
  addItemButtonTitle: string;
  side: 'left' | 'right';
  items: T[];
  itemComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  messageIsStreaming?: boolean;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  hasModel: () => boolean;
}

const Sidebar = <T,>({
  showOpenButton = true,
  isOpen,
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  footerComponent,
  searchTerm,
  messageIsStreaming,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  hasModel,
}: Props<T>) => {
  const { t } = useTranslation();
  return (
    <>
      <div
        className={`${
          isOpen ? 'w-[260px]' : 'w-0 hidden'
        } fixed top-0 ${side}-0 z-40 flex h-full flex-none flex-col bg-gray-50 dark:bg-[#202123] p-2 text-[14px] sm:relative  sm:top-0`}
      >
        <div
          className={cn(
            'flex items-center px-[6px] justify-between',
            side === 'right' && 'flex-row-reverse',
          )}
        >
          <Tips
            trigger={
              <Button
                variant="ghost"
                className="p-1 m-0 h-auto"
                onClick={toggleOpen}
              >
                {side === 'right' ? (
                  <IconLayoutSidebarRight size={26} />
                ) : (
                  <IconLayoutSidebar size={26} />
                )}
              </Button>
            }
          />
          {hasModel() && (
            <Tips
              trigger={
                <Button
                  onClick={() => {
                    handleCreateItem();
                  }}
                  disabled={messageIsStreaming}
                  variant="ghost"
                  className="p-1 m-0 h-auto"
                >
                  <IconSquarePlus size={26} />
                </Button>
              }
              content={addItemButtonTitle}
            />
          )}
        </div>

        <Search
          placeholder={t('Search...') || ''}
          searchTerm={searchTerm}
          onSearch={handleSearchTerm}
        />
        <div className="flex-grow overflow-auto scroll-container">
          {items?.length > 0 ? (
            <div className="pt-2">{itemComponent}</div>
          ) : (
            <div className="select-none text-center flex flex-col justify-center h-56 opacity-50">
              <IconSearch className="mx-auto mb-3" />
              <span className="text-[14px] leading-normal">{t('No data')}</span>
            </div>
          )}
        </div>
        {footerComponent}
      </div>

      {!isOpen && showOpenButton && (
        <div
          className={`group fixed z-20 ${
            side === 'right' ? 'right-2' : 'left-[14px]'
          }`}
          style={{ top: '4px' }}
        >
          <button className="pt-1" onClick={toggleOpen}>
            <span data-state="closed">
              <div className="flex items-center justify-center">
                {side === 'right' ? (
                  <div className="flex flex-col items-center">
                    <Button variant="ghost">
                      <IconLayoutSidebarRight size={26} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Button variant="ghost" className="p-1 m-0 h-auto">
                      <IconLayoutSidebar size={26} />
                    </Button>
                  </div>
                )}
              </div>
            </span>
          </button>
          {hasModel() && (
            <Tips
              trigger={
                <Button
                  onClick={() => {
                    handleCreateItem();
                  }}
                  disabled={messageIsStreaming}
                  variant="ghost"
                  className="p-1 m-0 h-auto"
                >
                  <IconSquarePlus size={26} />
                </Button>
              }
              content={addItemButtonTitle}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Sidebar;
