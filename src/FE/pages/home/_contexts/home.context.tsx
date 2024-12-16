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

import { ChatAction } from '../_reducers/chat.reducer';
import { MessageAction } from '../_reducers/message.reducer';

export interface HandleUpdateChatParams {
  isShared?: boolean;
  title?: string;
  chatModelId?: string;
}

export interface HomeInitialState {
  user: UserSession | null;
  userModelConfig: UserModelConfig | undefined;

  selectMessages: ChatMessage[];
  currentMessages: ChatMessage[];
  selectMessageLastId: string;
  currentChatMessageId: string;

  chats: ChatResult[];
  selectChat: IChat;
  chatsPaging: { count: number; page: number; pageSize: number };
  chatError: boolean;
  messageIsStreaming: boolean;

  models: AdminModelDto[];
  selectModel: AdminModelDto | undefined;
  selectModels: AdminModelDto[];

  prompts: Prompt[];
  searchTerm: string;

  settings: Settings;
}

export const initialState: HomeInitialState = {
  user: null,

  userModelConfig: undefined,

  selectMessages: [],
  selectMessageLastId: '',
  currentMessages: [],
  currentChatMessageId: '',

  chats: [],
  selectChat: {} as IChat,
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
  chatError: false,
  messageIsStreaming: false,

  models: [],
  selectModel: undefined,
  selectModels: [],

  prompts: [],
  searchTerm: '',

  settings: DEFAULT_SETTINGS,
};

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;

  chatDispatch: Dispatch<ChatAction>;
  messageDispatch: Dispatch<MessageAction>;

  handleNewChat: () => void;
  handleStartChat: (
    selectedMessages: ChatMessage[],
    selectedMessageId: string,
    currentMessageId: string,
  ) => void;
  handleUpdateChatStatus: (status: boolean) => void;
  handleUpdateChats: (chats: IChat[]) => void;
  handleCreateNewChat: () => Promise<ChatResult>;
  handleChatIsError: () => void;
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

export default HomeContext;
