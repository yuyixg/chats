import { useContext, useState } from 'react';

import Image from 'next/image';

import { Model, ModelProviders } from '@/types/model';
import { ModelProviderTemplates } from '@/types/template';

import { HomeContext } from '@/pages/home/home';

import { IconChevronDown } from '../Icons';
import Search from '../Search';
import { Button } from '../ui/button';
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
} from '../ui/dropdown-menu';

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
                  <Image
                    key={`img-${m.provider}`}
                    src={`/logos/${ModelProviderTemplates[m.provider].icon}`}
                    alt="Keycloak"
                    width={18}
                    height={18}
                    className="h-4 w-4 rounded-md dark:bg-white"
                  />
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
