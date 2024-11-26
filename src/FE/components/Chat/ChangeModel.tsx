import { useContext, useState } from 'react';

import { HomeContext } from '@/pages/home';

import ChatIcon from '@/components/ChatIcon/ChatIcon';
import { IconChevronDown } from '@/components/Icons';
import Search from '@/components/Search';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { AdminModelDto } from '@/types/adminApis';
import { feModelProviders } from '@/types/model';
import useTranslation from '@/hooks/useTranslation';

const ChangeModel = ({
  readonly,
  content,
  className,
  onChangeModel,
}: {
  readonly?: boolean;
  content?: string | React.JSX.Element;
  className?: string;
  onChangeModel: (model: AdminModelDto) => void;
}) => {
  const { t } = useTranslation();
  const {
    state: { models },
  } = useContext(HomeContext);
  const [searchTerm, setSearchTerm] = useState('');

  let modelGroup = [] as { providerId: number; child: AdminModelDto[] }[];
  const groupModel = () => {
    const modelList = searchTerm
      ? models.filter((model) => model.name.toLowerCase().includes(searchTerm))
      : models;
    modelList.forEach((m) => {
      const model = modelGroup.find((x) => x.providerId === m.modelProviderId);
      if (model) {
        model.child.push(m);
      } else {
        modelGroup.push({
          providerId: m.modelProviderId,
          child: [m],
        });
      }
    });
  };
  groupModel();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    groupModel();
  };

  const handleOpenMenu = () => {
    setSearchTerm('');
  };

  return (
    <DropdownMenu onOpenChange={handleOpenMenu}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-1 m-0 h-auto" disabled={readonly}>
          <span className={cn('text-[#7d7d7d] font-medium', className)}>
            {content && content}
          </span>
          {!readonly && typeof content === 'string' && (
            <IconChevronDown stroke="#7d7d7d" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        <Search
          className="p-2 mx-1"
          containerClassName="pt-1 pb-1"
          placeholder="Search..."
          searchTerm={searchTerm}
          onSearch={handleSearch}
        />
        <DropdownMenuGroup>
          {modelGroup.map((m) => {
            return (
              <DropdownMenuSub key={m.providerId}>
                <DropdownMenuSubTrigger
                  key={`trigger-${m.providerId}`}
                  className="p-2 flex gap-2"
                >
                  <ChatIcon providerId={m.providerId} />
                  {t(feModelProviders[m.providerId].name)}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-w-[64px] md:max-w-[200px]">
                    {m.child.map((x) => (
                      <DropdownMenuItem
                        key={x.modelId}
                        onClick={() => onChangeModel(x)}
                      >
                        {x.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChangeModel;
