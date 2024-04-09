import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { createOrder } from '@/apis/payApiService';
import { useRouter } from 'next/router';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const RechargeModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const { isOpen, onClose, onSuccessful } = props;
  const [amount, setAmount] = useState(50);
  const [isCustomAmount, setCustomAmount] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const amounts = [50, 100, 200, 500, 1000, 2000, 5000];

  const onPaying = () => {
    setPayLoading(true);
    createOrder(amount)
      .then((orderId) => {
        router.push('/payment/' + orderId);
      })
      .finally(() => {
        setPayLoading(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-5/6 sm:w-4/5 lg:w-[650px]'>
        <DialogHeader>
          <DialogTitle>{t('账号充值')}</DialogTitle>
        </DialogHeader>
        <div className='grid w-full items-center gap-6'>
          <div className='flex flex-col space-y-4'>
            <Label htmlFor='name'>支付金额：</Label>
            <div className='grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 '>
              {amounts.map((item) => (
                <Button
                  key={item}
                  className={cn(
                    'w-32',
                    item === amount &&
                      !isCustomAmount &&
                      'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                  )}
                  variant={'outline'}
                  onClick={() => {
                    setCustomAmount(false);
                    setAmount(item);
                  }}
                >
                  {item}元
                </Button>
              ))}
              <Button
                className={cn(
                  'w-32',
                  isCustomAmount &&
                    'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                )}
                variant={'outline'}
                onClick={() => {
                  setCustomAmount(true);
                  setAmount(1);
                }}
              >
                自定义
              </Button>
              {isCustomAmount && (
                <div className='w-full'>
                  <div className='flex items-center gap-2 w-48'>
                    <Input
                      className='w-full'
                      type='number'
                      value={amount}
                      min={0.1}
                      max={5000}
                      onChange={(e) => {
                        setAmount(+e.target.value);
                      }}
                    />
                    元
                  </div>
                  <span className='text-muted-foreground text-sm'>
                    最小充值金额 1 元
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-col space-y-4'>
            <Label htmlFor='name'>支付方式：</Label>
            <Button
              className='w-48 bg-[hsl(var(--primary))]/10 border-[hsl(var(--primary))]'
              variant='outline'
            >
              微信
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='default'
            disabled={payLoading}
            onClick={() => {
              onPaying();
            }}
          >
            确认支付
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
