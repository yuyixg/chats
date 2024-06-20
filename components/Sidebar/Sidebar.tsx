import { ReactNode, useContext } from 'react';

import { useTranslation } from 'next-i18next';

import { HomeContext } from '@/pages/home/home';

import {
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconMistOff,
  IconSquarePlus,
} from '@/components/Icons/index';

import ButtonToolTip from '../ButtonToolTip/ButtonToolTip';
import Search from '../Search';
import { Button } from '../ui/button';

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
  const { t } = useTranslation('prompt');
  const { dispatch: homeDispatch } = useContext(HomeContext);
  return (
    <>
      <div
        className={`${
          isOpen ? 'w-[260px]' : 'w-0 hidden'
        } fixed top-0 ${side}-0 z-40 flex h-full flex-none flex-col text-black bg-[#f9f9f9] dark:bg-[#202123] dark:text-white p-2 text-[14px] sm:relative  sm:top-0`}
      >
        <div
          className={cn(
            'flex items-center px-[6px] justify-between',
            side === 'right' && 'flex-row-reverse',
          )}
        >
          <ButtonToolTip
            trigger={
              <Button
                variant="ghost"
                className="p-1 m-0 h-auto"
                onClick={() => {
                  homeDispatch({
                    field: side === 'right' ? 'showPromptbar' : 'showChatbar',
                    value: false,
                  });
                }}
              >
                {side === 'right' ? (
                  <IconLayoutSidebarRight stroke="#7d7d7d" size={26} />
                ) : (
                  <IconLayoutSidebar stroke="#7d7d7d" size={26} />
                )}
              </Button>
            }
          />
          {hasModel() && (
            <ButtonToolTip
              trigger={
                <Button
                  onClick={() => {
                    handleCreateItem();
                    // handleSearchTerm('');
                  }}
                  disabled={messageIsStreaming}
                  variant="ghost"
                  className="p-1 m-0 h-auto"
                >
                  <IconSquarePlus stroke="#7d7d7d" size={26} />
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
        <div className="flex-grow overflow-auto">
          {items?.length > 0 ? (
            <div className="pt-2">{itemComponent}</div>
          ) : (
            <div className="mt-8 select-none text-center opacity-50">
              <IconMistOff className="mx-auto mb-3" />
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
          {hasModel() && (
            <ButtonToolTip
              trigger={
                <Button
                  onClick={() => {
                    handleCreateItem();
                    // handleSearchTerm('');
                  }}
                  disabled={messageIsStreaming}
                  variant="ghost"
                  className="p-1 m-0 h-auto"
                >
                  <IconSquarePlus stroke="#7d7d7d" size={26} />
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
