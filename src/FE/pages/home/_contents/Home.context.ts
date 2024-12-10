import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { DEFAULT_SETTINGS } from '@/utils/settings';
import { Settings } from '@/utils/settings';
import { UserSession } from '@/utils/user';

import { AdminModelDto } from '@/types/adminApis';
import { IChat } from '@/types/chat';
import { ChatMessage } from '@/types/chatMessage';
import { ChatResult, GetChatsParams } from '@/types/clientApis';
import { UserModelConfig } from '@/types/model';
import { Prompt } from '@/types/prompt';

export interface HandleUpdateChatParams {
  isShared?: boolean;
  title?: string;
  chatModelId?: string;
}

export interface HomeInitialState {
  user: UserSession | null;
  loading: boolean;
  messageIsStreaming: boolean;
  models: AdminModelDto[];
  chats: ChatResult[];
  chatsPaging: { count: number; page: number; pageSize: number };
  selectChat: IChat;
  selectModel: AdminModelDto | undefined;
  selectModels: AdminModelDto[];
  currentMessages: ChatMessage[];
  selectMessages: ChatMessage[];
  selectMessageLastId: string;
  currentChatMessageId: string;
  userModelConfig: UserModelConfig | undefined;
  chatError: boolean;
  prompts: Prompt[];
  settings: Settings;
  searchTerm: string;
}

const initialState: HomeInitialState = {
  user: null,
  loading: false,
  messageIsStreaming: false,
  currentMessages: [],
  userModelConfig: undefined,
  selectMessages: [],
  selectMessageLastId: '',
  currentChatMessageId: '',
  models: [],
  chats: [],
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
  selectModel: undefined,
  selectModels: [],
  selectChat: {} as IChat,
  chatError: false,
  prompts: [],
  settings: DEFAULT_SETTINGS,
  searchTerm: '',
};

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewChat: () => void;
  handleSelectChat: (chat: IChat) => void;
  handleUpdateChat: (
    chats: ChatResult[],
    id: string,
    params: HandleUpdateChatParams,
  ) => void;
  handleUpdateSelectMessage: (lastLeafId: string) => void;
  handleUpdateCurrentMessage: (chatId: string) => void;
  handleDeleteChat: (id: string) => void;
  handleSelectModel: (model: AdminModelDto) => void;
  handleUpdateUserModelConfig: (value: any) => void;
  handleUpdateSettings: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => void;
  hasModel: () => boolean;
  getChats: (params: GetChatsParams, models?: AdminModelDto[]) => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export { initialState, HomeContext };
