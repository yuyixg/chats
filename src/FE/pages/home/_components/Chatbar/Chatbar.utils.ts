import useTranslation from '@/hooks/useTranslation';

import { IChat } from '@/types/chat';

export const chatsGroupByUpdatedAt = (data: IChat[]): Map<string, IChat[]> => {
  const groupedData = new Map<string, IChat[]>();
  const { t } = useTranslation();
  const now = new Date();

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isWithinDays = (date: Date, days: number): boolean => {
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - days);
    return date >= pastDate && date <= now;
  };

  data.forEach((item) => {
    const date = new Date(item.updatedAt);

    let groupKey: string;

    if (isSameDay(date, now)) {
      groupKey = t('Today');
    } else if (
      isSameDay(
        date,
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      )
    ) {
      groupKey = t('Yesterday');
    } else if (isWithinDays(date, 7)) {
      groupKey = t('Last 7 days');
    } else if (isWithinDays(date, 30)) {
      groupKey = t('Last 30 days');
    } else {
      groupKey = `${date.getFullYear()}`;
    }

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, []);
    }

    groupedData.get(groupKey)!.push(item);
  });

  return groupedData;
};
