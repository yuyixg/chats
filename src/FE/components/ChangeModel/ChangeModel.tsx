import { useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { AdminModelDto } from '@/types/adminApis';
import { feModelProviders } from '@/types/model';

import ChatIcon from '@/components/ChatIcon/ChatIcon';
import { IconChevronDown } from '@/components/Icons';
import Search from '@/components/Search/Search';
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

const ChangeChatModelDropdownMenu = ({
  models,
  readonly,
  content,
  className,
  onChangeModel,
}: {
  models: AdminModelDto[];
  readonly?: boolean;
  content?: string | React.JSX.Element;
  className?: string;
  onChangeModel: (model: AdminModelDto) => void;
}) => {
  const { t } = useTranslation();
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
      <DropdownMenuTrigger
        disabled={readonly}
        className="focus:outline-none hover:bg-muted rounded-sm p-1 m-0 h-auto flex items-center gap-1"
      >
        <>
          <span
            className={cn(
              'font-medium px-1 w-44 md:w-full text-nowrap overflow-hidden text-ellipsis whitespace-nowrap',
              className,
            )}
          >
            {content && content}
          </span>
          {!readonly && typeof content === 'string' && <IconChevronDown />}
        </>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 md:w-48">
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
                  <span className="w-full text-nowrap overflow-hidden text-ellipsis whitespace-nowrap">
                    {t(feModelProviders[m.providerId].name)}
                  </span>
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

export default ChangeChatModelDropdownMenu;
