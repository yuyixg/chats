import useTranslation from '@/hooks/useTranslation';

import { IconModelSearch } from '../Icons';

const NoModel = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex items-center flex-wrap justify-center gap-10">
      <div className="grid gap-4 w-60">
        <div className="w-20 h-20 mx-auto">
          <IconModelSearch size={64} />
        </div>
        <div>
          <h2 className="text-center text-lg font-semibold leading-relaxed pb-1">
            {t("There's no model here")}
          </h2>
          <p className="text-center text-sm font-normal leading-snug pb-4">
            {t('You can contact the administrator or create one yourself')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoModel;
