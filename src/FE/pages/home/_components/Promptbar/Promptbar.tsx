import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useCreateReducer } from '@/hooks/useCreateReducer';
import useTranslation from '@/hooks/useTranslation';

import { Prompt, PromptSlim } from '@/types/prompt';

import { setPrompts } from '../../_actions/prompt.actions';
import { setShowPromptBar } from '../../_actions/setting.actions';
import HomeContext from '../../_contexts/home.context';
import Sidebar from '../Sidebar/Sidebar';
import PromptbarContext from './PromptBar.context';
import { PromptbarInitialState, initialState } from './PromptBar.context';
import Prompts from './Prompts';

import {
  deleteUserPrompts,
  postUserPrompts,
  putUserPrompts,
} from '@/apis/clientApis';

const PromptBar = () => {
  const { t } = useTranslation();

  const promptBarContextValue = useCreateReducer<PromptbarInitialState>({
    initialState,
  });

  const {
    state: { prompts, showPromptBar },
    settingDispatch,
    promptDispatch,
    hasModel,
  } = useContext(HomeContext);

  const [filteredPrompts, setFilteredPrompts] = useState<PromptSlim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTogglePromptBar = () => {
    settingDispatch(setShowPromptBar(!showPromptBar));
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
      const newPrompts = [...prompts, data];
      promptDispatch(setPrompts(newPrompts));
      changeFilteredPrompts(newPrompts);
      toast.success(t('Created successful'));
    });
  };

  const handleDeletePrompt = (prompt: PromptSlim) => {
    deleteUserPrompts(prompt.id).then(() => {
      const newPrompts = prompts.filter((p) => p.id !== prompt.id);
      promptDispatch(setPrompts(newPrompts));
      changeFilteredPrompts(newPrompts);
      toast.success(t('Deleted successful'));
    });
  };

  const handleUpdatePrompt = (prompt: Prompt) => {
    putUserPrompts(prompt.id, prompt).then(() => {
      const existingPrompts = prompts.filter((x) => x.id !== prompt.id);
      const newPrompts = [...existingPrompts, prompt];
      promptDispatch(setPrompts(newPrompts));
      changeFilteredPrompts(newPrompts);
      toast.success(t('Updated successful'));
    });
  };

  const changeFilteredPrompts = (promptList: PromptSlim[]) => {
    setFilteredPrompts(
      promptList.filter((prompt) => {
        const searchable = prompt.name.toLowerCase();
        return searchable.includes(searchTerm.toLowerCase());
      }),
    );
  };

  useEffect(() => {
    if (searchTerm) {
      changeFilteredPrompts(prompts);
    } else {
      setFilteredPrompts(prompts);
    }
  }, [searchTerm]);

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
        isOpen={showPromptBar}
        addItemButtonTitle={t('New prompt')}
        itemComponent={<Prompts prompts={filteredPrompts} />}
        items={filteredPrompts}
        searchTerm={searchTerm}
        handleSearchTerm={(value: string) => setSearchTerm(value)}
        toggleOpen={handleTogglePromptBar}
        handleCreateItem={handleCreatePrompt}
      />
    </PromptbarContext.Provider>
  );
};

export default PromptBar;
