import { ConversationComponent } from './Conversation';
import { ChatResult } from '@/apis/userService';

interface Props {
  chats: ChatResult[];
}

export const Conversations = ({ chats }: Props) => {
  return (
    <div className='flex w-full flex-col gap-1'>
      {chats
        .slice()
        .reverse()
        .map((chat, index) => (
          <ConversationComponent key={index} chat={chat} />
        ))}
    </div>
  );
};
