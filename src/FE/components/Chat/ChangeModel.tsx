import { useContext, useState } from 'react';

import { Model, ModelProviders } from '@/types/model';
import { ModelProviderTemplates } from '@/types/template';

import { HomeContext } from '@/pages/home/home';

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

const ChangeModel = ({
  readonly,
  content,
  className,
  onChangeModel,
}: {
  readonly?: boolean;
  content?: string | React.JSX.Element;
  className?: string;
  onChangeModel: (model: Model) => void;
}) => {
  const {
    state: { models },
  } = useContext(HomeContext);
  const [searchTerm, setSearchTerm] = useState('');
  let modelGroup = [] as { provider: ModelProviders; child: Model[] }[];
  const groupModel = () => {
    const modelList = searchTerm
      ? models.filter((model) => model.name.toLowerCase().includes(searchTerm))
      : models;
    modelList.forEach((m) => {
      const model = modelGroup.find((x) => x.provider === m.modelProvider);
      if (model) {
        model.child.push(m);
      } else {
        modelGroup.push({
          provider: m.modelProvider,
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
              <DropdownMenuSub key={m.provider}>
                <DropdownMenuSubTrigger
                  key={`trigger-${m.provider}`}
                  className="p-2 flex gap-2"
                >
                  <ChatIcon provider={m.provider} />
                  {ModelProviderTemplates[m.provider].displayName}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-w-[64px] md:max-w-[200px]">
                    {m.child.map((x) => (
                      <DropdownMenuItem
                        key={x.id}
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
