import { FC, ForwardedRef, MutableRefObject, forwardRef } from 'react';

import { Prompt } from '@/types/prompt';

interface Props {
  prompts: Prompt[];
  activePromptIndex: number;
  onSelect: () => void;
  onMouseOver: (index: number) => void;
}

export const PromptList = forwardRef(
  (
    { prompts, activePromptIndex, onSelect, onMouseOver }: Props,
    promptListRef: ForwardedRef<HTMLUListElement | null>,
  ) => {
    return (
      <ul
        ref={promptListRef}
        className="z-10 max-h-52 w-full overflow-y-auto rounded border border-black/10 shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-neutral-500 dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
      >
        {prompts.map((prompt, index) => (
          <li
            key={prompt.id}
            className={`${
              index === activePromptIndex
                ? 'bg-gray-200 dark:bg-black dark:text-black'
                : ''
            } cursor-pointer px-3 py-2 text-sm text-black dark:text-white`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }}
            onMouseEnter={() => onMouseOver(index)}
          >
            {prompt.name}
          </li>
        ))}
      </ul>
    );
  },
);
