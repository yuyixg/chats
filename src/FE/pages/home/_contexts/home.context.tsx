import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { AdminModelDto } from '@/types/adminApis';
import { IChat } from '@/types/chat';
import { ChatMessage } from '@/types/chatMessage';
import { ChatResult, GetChatsParams } from '@/types/clientApis';
import { Prompt, PromptSlim } from '@/types/prompt';

import { ChatAction } from '../_reducers/chat.reducer';
import { MessageAction } from '../_reducers/message.reducer';
import { ModelAction } from '../_reducers/model.reducer';
import { PromptAction } from '../_reducers/prompt.reducer';
import { SettingsAction } from '../_reducers/setting.reducer';
import { UserModelConfigAction } from '../_reducers/userModelConfig.reducer';

export interface HandleUpdateChatParams {
  isShared?: boolean;
  title?: string;
  chatModelId?: string;
}

export interface HomeInitialState {
  prompt: string | null;
  temperature: number | null;
  enableSearch: boolean | null;

  messages: ChatMessage[];
  selectedMessages: ChatMessage[][];
  currentMessages: ChatMessage[];
  selectedMessageLastId: string;
  currentChatMessageId: string;

  chats: ChatResult[];
  selectedChat: IChat;
  chatsPaging: { count: number; page: number; pageSize: number };
  chatError: boolean;
  messageIsStreaming: boolean;
  isChatsLoading: boolean;

  models: AdminModelDto[];
  modelMap: Record<string, AdminModelDto>;
  selectModel: AdminModelDto | undefined;
  selectedModels: AdminModelDto[];

  defaultPrompt: Prompt | null;
  prompts: PromptSlim[];

  showChatBar: boolean;
  showPromptBar: boolean;
}

export const initialState: HomeInitialState = {
  prompt: null,
  temperature: null,
  enableSearch: null,

  messages: [],
  selectedMessages: [],
  selectedMessageLastId: '',
  currentMessages: [],
  currentChatMessageId: '',

  chats: [],
  selectedChat: {} as IChat,
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
  chatError: false,
  messageIsStreaming: false,
  isChatsLoading: false,

  models: [],
  modelMap: {},
  selectModel: undefined,
  selectedModels: [],

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
  userModelConfigDispatch: Dispatch<UserModelConfigAction>;
  settingDispatch: Dispatch<SettingsAction>;
  promptDispatch: Dispatch<PromptAction>;

  handleSelectModel: (model: AdminModelDto) => void;
  hasModel: () => boolean;
  handleNewChat: () => void;
  handleStartChat: (
    selectedMessages: ChatMessage[][],
    selectedMessageId: string,
    currentMessageId: string,
  ) => void;
  handleUpdateChats: (chats: IChat[]) => void;
  handleCreateNewChat: () => Promise<ChatResult>;
  handleChatIsError: () => void;
  handleDeleteChat: (id: string) => void;
  handleSelectChat: (chat: IChat) => void;
  handleUpdateChat: (
    chats: ChatResult[],
    id: string,
    params: HandleUpdateChatParams,
  ) => void;
  getChats: (params: GetChatsParams, models?: AdminModelDto[]) => void;
  handleStopChats: () => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
