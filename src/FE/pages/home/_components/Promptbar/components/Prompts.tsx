import { FC } from 'react';

import { PromptSlim } from '@/types/prompt';

import { PromptComponent } from './Prompt';

interface Props {
  prompts: PromptSlim[];
}

export const Prompts: FC<Props> = ({ prompts }) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {prompts
        .slice()
        .reverse()
        .map((prompt, index) => (
          <PromptComponent key={index} prompt={prompt} />
        ))}
    </div>
  );
};
