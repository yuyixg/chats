import { getUserInfo } from '@/utils/user';

import { Avatar, AvatarFallback } from '../ui/avatar';

export const ChatAvatar = (props: { content?: JSX.Element | string }) => {
  const { content } = props;
  const user = getUserInfo();
  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="text-sm font-medium">
        {content || user?.username[0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
