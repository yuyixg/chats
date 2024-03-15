import { UserModel } from '@/dbs/userModels';
import { ChatModelConfig } from '@/types/model';

export function verifyModel(model: UserModel, config: ChatModelConfig) {
  const { maxLength = 0 } = config;
  const { tokens, counts, expires } = model;
  const result = {
    tokens: 'Not enough Tokens',
    counts: 'Not enough Counts',
    expires: 'Subscription has expired',
  };

  if (tokens && tokens !== null) {
    if (tokens < maxLength) {
      return result.tokens;
    }
  }

  if (counts && counts !== null) {
    if (counts < 0) {
      return result.counts;
    }
  }

  if (expires && expires !== null) {
    if (new Date(expires) < new Date()) {
      return result.expires;
    }
  }

  return null;
}
