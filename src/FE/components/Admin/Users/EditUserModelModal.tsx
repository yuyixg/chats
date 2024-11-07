import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { GetModelResult } from '@/types/admin';
import { UserInitialModel } from '@/types/user';

import { IconSquareRoundedX } from '@/components/Icons';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { putUserModel } from '@/apis/adminApis';
import { cn } from '@/lib/utils';

interface IProps {
  userModelId: string;
  models: GetModelResult[];
  select: UserInitialModel[];
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
}
let ModelKeyMap = {} as any;
export const EditUserModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { models, isOpen, select, onClose, onSuccessful } = props;
  const [submit, setSubmit] = useState(false);
  const [editModels, setEditModels] = useState<UserInitialModel[]>([]);
  const termDateString = new Date(new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(); // 10 years

  useEffect(() => {
    if (isOpen) {
      setEditModels([]);
      const model = models.map((x) => {
        ModelKeyMap[x.modelId] = x.name;
        const model = select.find((model) => model.modelId === x.modelId);
        if (model) return model;
        return {
          modelId: x.modelId,
          tokens: 0,
          counts: 0,
          expires: termDateString,
          enabled: false,
        };
      });
      setEditModels(model);
    }
  }, [isOpen]);

  const onSubmit = async () => {
    setSubmit(true);
    console.log(editModels);
    putUserModel({ models: editModels })
      .then(() => {
        toast.success(t('Save successful!'));
        onSuccessful();
      })
      .catch(async (err) => {
        try {
          const resp = await err.json();
          toast.error(resp.message);
        } catch {
          toast.error(t('Operation failed! Please try again later, or contact technical personnel.'));
        }
      })
      .finally(() => {
        setSubmit(false);
      });
  };

  const onChangeModel = (
    index: number,
    type: 'tokens' | 'counts' | 'expires' | 'enabled',
    value: any,
  ) => {
    const _models = editModels as any;
    _models[index][type] = value;
    setEditModels([..._models]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Edit User Model')}</DialogTitle>
        </DialogHeader>
        <div className="h-96 overflow-scroll flex justify-start gap-2 flex-wrap">
          <Table>
            <TableHeader>
              <TableRow className="pointer-events-none">
                <TableHead>{t('Model Display Name')}</TableHead>
                <TableHead>{t('Tokens')}</TableHead>
                <TableHead>{t('Chat Counts')}</TableHead>
                <TableHead>{t('Expiration Time')}</TableHead>
                <TableHead>{t('Is Enabled')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editModels.map((model, index) => (
                <TableRow key={model.modelId}>
                  <TableCell>{ModelKeyMap[model.modelId]}</TableCell>
                  <TableCell>
                    <Input
                      className="w-30"
                      value={model.tokens?.toString()}
                      onChange={(e) => {
                        onChangeModel(index, 'tokens', parseInt(e.target.value) || 0);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-30"
                      value={model.counts?.toString()}
                      onChange={(e) => {
                        onChangeModel(index, 'counts', parseInt(e.target.value) || 0);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn('pl-3 text-left font-normal w-[150px]')}
                        >
                          {new Date(model.expires).toLocaleDateString()}
                          <IconSquareRoundedX
                            onClick={(e) => {
                              onChangeModel(index, 'expires', termDateString);
                              e.preventDefault();
                            }}
                            className="z-10 ml-auto h-5 w-5 opacity-50"
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(model.expires)}
                          onSelect={d => { onChangeModel(index, 'expires', d?.toISOString()); }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={model.enabled}
                      onCheckedChange={(checked) => { onChangeModel(index, 'enabled', checked); }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="pt-4">
          <Button disabled={submit} onClick={onSubmit} type="submit">
            {t('Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
