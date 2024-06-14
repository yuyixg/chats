import { FC, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { IconX } from '@/components/Icons/index';

interface Props {
  placeholder: string;
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
}
const Search: FC<Props> = ({ placeholder, searchTerm, onSearch }) => {
  const { t } = useTranslation('sidebar');
  const [query, setQuery] = useState<string>('');
  const timeoutRef = useRef<number | undefined>(undefined);

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
    onSearch('');
    setQuery('');
  };

  return (
    <div className="relative flex items-center pt-2">
      <input
        className="w-full flex-1 rounded-md px-3 py-3 pr-10 text-[14px] bg-[#ececec] dark:bg-[#262630] leading-3 border-none outline-none"
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
