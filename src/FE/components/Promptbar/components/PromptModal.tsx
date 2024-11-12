import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { PromptVariables } from '@/utils/promptVariable';

import { Prompt } from '@/types/prompt';

import { IconInfo } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  prompt: Prompt;
  onClose: () => void;
  onUpdatePrompt: (prompt: Prompt) => void;
}

export const PromptModal: FC<Props> = ({ prompt, onClose, onUpdatePrompt }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(prompt.name);
  const [description, setDescription] = useState(prompt.description);
  const [content, setContent] = useState(prompt.content);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      onUpdatePrompt({ ...prompt, name, description, content: content.trim() });
      onClose();
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <Dialog open={!!prompt} onOpenChange={onClose}>
      <DialogContent className="w-2/5" onKeyDown={handleEnter}>
        <div className="text-sm font-bold text-black dark:text-neutral-200">
          {t('Name')}
        </div>
        <Input
          ref={nameInputRef}
          placeholder={t('A name for your prompt.') || ''}
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></Input>

        <div className="mt-4 gap-1 text-sm flex align-middle items-center font-bold text-black dark:text-neutral-200">
          {t('Prompt')}
          <Tips
            trigger={
              <Button className="w-auto h-auto" size="icon" variant="link">
                <IconInfo size={18} />
              </Button>
            }
            content={
              <div className="text-xs font-normal">
                <span className="font-semibold">{t('System Variables')}</span>
                <div className="mt-2 flex-col">
                  {Object.keys(PromptVariables).map((key) => (
                    <p key={key}>
                      {key}：
                      {PromptVariables[key as keyof typeof PromptVariables]()}
                    </p>
                  ))}
                </div>
              </div>
            }
          />
        </div>
        <Textarea
          placeholder={
            t(
              'Prompt content. Use {{}} to denote a variable. Ex: {{name}} is a {{adjective}} {{noun}}',
            ) || ''
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
        ></Textarea>
        <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
          {t('Description')}
        </div>
        <Textarea
          placeholder={t('A description for your prompt.') || ''}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        ></Textarea>
        <Button
          onClick={() => {
            const updatedPrompt = {
              ...prompt,
              name,
              description,
              content: content.trim(),
            };

            onUpdatePrompt(updatedPrompt);
            onClose();
          }}
        >
          {t('Save')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
