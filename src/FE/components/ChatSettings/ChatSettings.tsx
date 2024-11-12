import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface Props {
  name: string;
  value?: string;
  component?: JSX.Element;
}
const ChatSettings = (props: Props) => {
  const { name, value } = props;
  return (
    <div>
      <div className="flex justify-between py-2">
        <span className="text-base w-[70%]">{name}</span>
        <span className="text-base w-[30%] text-center">{value}</span>
      </div>
      <div className="flex py-1 gap-2">
        <Slider defaultValue={[50]} max={100} step={1} className="w-[70%]" />
        <Input
          type="number"
          className="no-spin-button text-xs px-2 w-[30%] h-1 bg-[#ececec] dark:bg-[#262630] border-none outline-none"
        />
      </div>
    </div>
  );
};

export default ChatSettings;
