import { useTranslation } from 'next-i18next';
import Image from 'next/image';

import { getSiteInfo } from '@/utils/website';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = (props: IProps) => {
  const { t } = useTranslation('sidebar');
  const { isOpen, onClose } = props;
  const contact = getSiteInfo().contact;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full w- max-w-2xl">
        <DialogHeader className="mb-[16px]">
          <DialogTitle>{t('Contact')}</DialogTitle>
          <div className="flex justify-center pt-10 gap-4">
            {contact?.qqGroupNumber && (
              <div>
                <div className="flex justify-center">
                  <Image
                    key={'qq.png'}
                    src={'/qq.png'}
                    alt="qq"
                    width={180}
                    height={180}
                    className="h-[120px] w-[120px] rounded-md dark:bg-white"
                  />
                </div>
                <span className="flex justify-center text-sm pt-2">
                  QQ群 {` ${contact.qqGroupNumber}`}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
