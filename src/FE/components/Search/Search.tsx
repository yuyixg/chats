import { FC, useContext, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { HomeContext } from '@/pages/home/home';

import { IconX } from '@/components/Icons/index';

import { cn } from '@/lib/utils';

interface Props {
  placeholder: string;
  searchTerm: string;
  className?: string;
  containerClassName?: string;
  onSearch: (searchTerm: string) => void;
}
const Search: FC<Props> = ({
  placeholder,
  searchTerm,
  className,
  containerClassName,
  onSearch,
}) => {
  const { t } = useTranslation('client');
  const [query, setQuery] = useState<string>('');
  const timeoutRef = useRef<number | undefined>(undefined);
  const {
    state: { messageIsStreaming },
  } = useContext(HomeContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const clearSearch = () => {
    if (messageIsStreaming) return;
    onSearch('');
    setQuery('');
  };

  return (
    <div className={cn('relative flex items-center pt-2', containerClassName)}>
      <input
        disabled={messageIsStreaming}
        className={cn(
          'w-full flex-1 rounded-md px-3 py-3 pr-10 text-[14px] bg-[#ececec] dark:bg-[#262630] leading-3 border-none outline-none',
          className,
        )}
        type="text"
        placeholder={t(placeholder) || ''}
        value={query}
        onChange={handleChange}
      />

      {searchTerm && (
        <IconX
          className="absolute right-[15px] cursor-pointer text-neutral-300 hover:text-neutral-400"
          size={18}
          onClick={clearSearch}
        />
      )}
    </div>
  );
};

export default Search;
