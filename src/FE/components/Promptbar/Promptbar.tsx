import { useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { Prompt, PromptSlim } from '@/types/prompt';

import { HomeContext } from '@/pages/home';

import { Prompts } from './components/Prompts';
import Sidebar from '@/components/Sidebar';

import PromptbarContext from './PromptBar.context';
import { PromptbarInitialState, initialState } from './Promptbar.state';

import {
  deleteUserPrompts,
  postUserPrompts,
  putUserPrompts,
} from '@/apis/clientApis';
import { PostPromptParams } from '@/types/adminApis';

const PromptBar = () => {
  const { t } = useTranslation();

  const promptBarContextValue = useCreateReducer<PromptbarInitialState>({
    initialState,
  });

  const {
    state: { prompts, settings },
    dispatch: homeDispatch,
    handleUpdateSettings,
    hasModel,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredPrompts },
    dispatch: promptDispatch,
  } = promptBarContextValue;

  const handleTogglePromptBar = () => {
    const promptBar = !settings.showChatBar;
    handleUpdateSettings('showPromptBar', promptBar);
  };

  const handleCreatePrompt = () => {
    const newPrompt: Prompt = {
      id: 0,
      name: `Prompt ${prompts.length + 1}`,
      content: '',
      isDefault: false,
      isSystem: false,
      temperature: null,
    };

    postUserPrompts(newPrompt).then((data) => {
      const updatedPrompts = [...prompts, data];
      homeDispatch({ field: 'prompts', value: updatedPrompts });
      toast.success(t('Created successful'));
    });
  };

  const handleDeletePrompt = (prompt: PromptSlim) => {
    deleteUserPrompts(prompt.id).then(() => {
      const updatedPrompts = prompts.filter((p) => p.id !== prompt.id);
      homeDispatch({ field: 'prompts', value: updatedPrompts });
      toast.success(t('Deleted successful'));
    });
  };

  const handleUpdatePrompt = (prompt: Prompt) => {
    putUserPrompts(prompt.id, prompt).then(() => {
      const existingPrompts = prompts.filter(x => x.id !== prompt.id);
      homeDispatch({ field: 'prompts', value: [...existingPrompts, prompt] });
      toast.success(t('Updated successful'));
    });
  };

  useEffect(() => {
    if (searchTerm) {
      promptDispatch({
        field: 'filteredPrompts',
        value: prompts.filter((prompt) => {
          const searchable =
            prompt.name.toLowerCase() +
            ' ' +
            prompt.content.toLowerCase();
          return searchable.includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      promptDispatch({ field: 'filteredPrompts', value: prompts });
    }
  }, [searchTerm, prompts]);

  return (
    <PromptbarContext.Provider
      value={{
        ...promptBarContextValue,
        handleCreatePrompt,
        handleDeletePrompt,
        handleUpdatePrompt,
      }}
    >
      <Sidebar<PromptSlim>
        hasModel={hasModel}
        side={'right'}
        showOpenButton={false}
        isOpen={settings.showPromptBar}
        addItemButtonTitle={t('New prompt')}
        itemComponent={<Prompts prompts={filteredPrompts} />}
        items={filteredPrompts}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          promptDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleTogglePromptBar}
        handleCreateItem={handleCreatePrompt}
      />
    </PromptbarContext.Provider>
  );
};

export default PromptBar;
