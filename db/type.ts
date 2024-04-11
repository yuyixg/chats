import Decimal from 'decimal.js';

export interface MessagesRelate {
  id: string;
  userId: string;
  chatModelId: string;
  name: string;
  prompt: string | null;
  messages: string;
  tokenCount: number;
  chatCount: number;
  totalPrice: Decimal;
  isDeleted: boolean | null;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  chatModel: {
    id: string;
    name: string;
    modelVersion: string;
    type: string;
    fileServerId: string | null;
    fileConfig: string | null;
    modelConfig: string;
  };
}

export interface UsersRelate {
  id: string;
  avatar: string | null;
  account: string | null;
  username: string | null;
  password: string;
  email: string | null;
  phone: string | null;
  role: string;
  enabled: boolean;
  provider: string | null;
  sub: string | null;
  createdAt: Date;
  updatedAt: Date;
  userBalances: {
    balance: Decimal;
  } | null;
}
