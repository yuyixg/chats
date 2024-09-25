import { useTranslation } from 'next-i18next';

import { IconError } from '@/components/Icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  error?: string;
}

const ChatError = (props: Props) => {
  const { error } = props;

  const { t } = useTranslation('client');

  function errorMessage() {
    let message = error
      ? t(error)
      : t(
          'There were some errors during the chat. You can switch models or try again later.',
        );
    return message;
  }

  return (
    <Alert variant="destructive" className="bg-[#f93a370d] my-2 border-none">
      <AlertDescription className="flex items-center gap-1">
        <IconError stroke="#ef4444" />
        {errorMessage()}
      </AlertDescription>
    </Alert>
  );
};

export default ChatError;
