import { useContext } from 'react';

import Image from 'next/image';

import { Model, ModelProviders } from '@/types/model';
import { ModelProviderTemplates } from '@/types/template';

import { HomeContext } from '@/pages/home/home';

import { IconChevronDown } from '../Icons';
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
  modelName,
  className,
  onChangeModel,
}: {
  readonly?: boolean;
  modelName?: string;
  className?: string;
  onChangeModel: (model: Model) => void;
}) => {
  const {
    state: { models },
  } = useContext(HomeContext);

  let modelGroup = [] as { provider: ModelProviders; child: Model[] }[];
  const groupModel = () => {
    models.forEach((m) => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-1 m-0 h-auto" disabled={readonly}>
          <span className={cn('text-[#7d7d7d] font-medium', className)}>
            {modelName}
          </span>
          {!readonly && <IconChevronDown stroke="#7d7d7d" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-42">
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
                    src={`/${ModelProviderTemplates[m.provider].icon}`}
                    alt="KeyCloak"
                    width={18}
                    height={18}
                    className="h-4 w-4 rounded-md dark:bg-white"
                  />
                  {ModelProviderTemplates[m.provider].displayName}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
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
