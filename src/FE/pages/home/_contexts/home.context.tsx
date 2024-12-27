import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { AdminModelDto } from '@/types/adminApis';
import { IChat } from '@/types/chat';
import { IChatMessage } from '@/types/chatMessage';
import { ChatResult, GetChatsParams } from '@/types/clientApis';
import { Prompt, PromptSlim } from '@/types/prompt';

import { ChatAction } from '../_reducers/chat.reducer';
import { MessageAction } from '../_reducers/message.reducer';
import { ModelAction } from '../_reducers/model.reducer';
import { PromptAction } from '../_reducers/prompt.reducer';
import { SettingsAction } from '../_reducers/setting.reducer';

export interface HandleUpdateChatParams {
  isShared?: boolean;
  title?: string;
  chatModelId?: string;
}

export interface HomeInitialState {
  messages: IChatMessage[];
  selectedMessages: IChatMessage[][];

  chats: ChatResult[];
  selectedChat: IChat;
  chatsPaging: { count: number; page: number; pageSize: number };
  isChatsLoading: boolean;

  models: AdminModelDto[];
  modelMap: Record<string, AdminModelDto>;

  defaultPrompt: Prompt | null;
  prompts: PromptSlim[];

  showChatBar: boolean;
  showPromptBar: boolean;
}

export const initialState: HomeInitialState = {
  messages: [],
  selectedMessages: [],

  chats: [],
  selectedChat: {} as IChat,
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
  isChatsLoading: false,

  models: [],
  modelMap: {},

  defaultPrompt: null,
  prompts: [],

  showChatBar: true,
  showPromptBar: false,
};

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;

  chatDispatch: Dispatch<ChatAction>;
  messageDispatch: Dispatch<MessageAction>;
  modelDispatch: Dispatch<ModelAction>;
  settingDispatch: Dispatch<SettingsAction>;
  promptDispatch: Dispatch<PromptAction>;

  hasModel: () => boolean;
  handleNewChat: () => void;
  handleDeleteChat: (id: string) => void;
  handleSelectChat: (chat: IChat) => void;
  handleUpdateChat: (
    chats: ChatResult[],
    id: string,
    params: HandleUpdateChatParams,
  ) => void;
  getChats: (params: GetChatsParams, isAppend?: boolean) => void;
  handleStopChats: () => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
