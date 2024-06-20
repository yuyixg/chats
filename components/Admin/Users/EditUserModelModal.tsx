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

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

import { putUserModel } from '@/apis/adminService';
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
  const { userModelId, models, isOpen, select, onClose, onSuccessful } = props;
  const [submit, setSubmit] = useState(false);
  const [editModels, setEditModels] = useState<UserInitialModel[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEditModels([]);
      const model = models.map((x) => {
        ModelKeyMap[x.modelId] = x.name;
        const model = select.find((model) => model.modelId === x.modelId);
        if (model) return model;
        return {
          modelId: x.modelId,
          tokens: '0',
          counts: '0',
          expires: '-',
          enabled: false,
        };
      });
      setEditModels(model);
    }
  }, [isOpen]);

  const onSubmit = () => {
    setSubmit(true);
    console.log({
      userModelId,
      models: editModels.filter(
        (x) =>
          x.enabled ||
          x.counts !== '0' ||
          x.tokens !== '0' ||
          x.expires !== '-',
      ),
    });
    putUserModel({ userModelId, models: editModels })
      .then(() => {
        toast.success(t('Save successful!'));
        onSuccessful();
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
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
                      value={model.tokens}
                      onChange={(e) => {
                        onChangeModel(index, 'tokens', e.target.value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-30"
                      value={model.counts}
                      onChange={(e) => {
                        onChangeModel(index, 'counts', e.target.value);
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
                          {model.expires ? (
                            model.expires === '-' ? null : (
                              new Date(model.expires).toLocaleDateString()
                            )
                          ) : (
                            <span></span>
                          )}
                          <IconSquareRoundedX
                            onClick={(e) => {
                              onChangeModel(index, 'expires', '-');
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
                          onSelect={(d) => {
                            onChangeModel(
                              index,
                              'expires',
                              d?.toLocaleDateString(),
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={model.enabled}
                      onCheckedChange={(checked) => {
                        onChangeModel(index, 'enabled', checked);
                      }}
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
