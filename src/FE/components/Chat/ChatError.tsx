import { useTranslation } from 'next-i18next';

import { IconError } from '../Icons';
import { Alert, AlertDescription } from '../ui/alert';

const ChatError = () => {
  const { t } = useTranslation('chat');
  return (
    <Alert variant="destructive" className="bg-[#f93a370d]">
      <AlertDescription className="flex items-center gap-1">
        <IconError stroke="#7f1d1d" />
        {t(
          'There were some errors during the chat. You can switch models or try again later.',
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ChatError;
