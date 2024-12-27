import { IconChevronLeft, IconChevronRight } from '@/components/Icons';
import { Button } from '@/components/ui/button';

interface Props {
  hidden?: boolean;
  disabledPrev?: boolean;
  disabledNext?: boolean;
  currentSelectIndex: number;
  messageIds: string[];
  onChangeMessage?: (messageId: string) => void;
}

export const PaginationAction = (props: Props) => {
  const {
    disabledPrev,
    disabledNext,
    currentSelectIndex,
    messageIds,
    onChangeMessage,
    hidden,
  } = props;

  const Render = () => {
    return (
      <div className="flex text-sm items-center">
        <Button
          variant="ghost"
          className="p-1 m-0 h-7 w-7 disabled:opacity-50"
          disabled={disabledPrev}
          onClick={(e) => {
            if (onChangeMessage) {
              const index = currentSelectIndex - 1;
              onChangeMessage(messageIds[index]);
              e.stopPropagation();
            }
          }}
        >
          <IconChevronLeft />
        </Button>
        <span className="font-bold">
          {`${currentSelectIndex + 1}/${messageIds.length}`}
        </span>
        <Button
          variant="ghost"
          className="p-1 m-0 h-7 w-7"
          disabled={disabledNext}
          onClick={(e) => {
            if (onChangeMessage) {
              const index = currentSelectIndex + 1;
              onChangeMessage(messageIds[index]);
            }
            e.stopPropagation();
          }}
        >
          <IconChevronRight />
        </Button>
      </div>
    );
  };

  return <>{!hidden && Render()}</>;
};

export default PaginationAction;
