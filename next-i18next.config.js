module.exports = {
    i18n: {
        defaultLocale: 'zh',
        locales: [
            'en',
            'zh',
        ],
        localeSubpaths: {
        },
    },
    react: { useSuspense: false },
    localePath:
        typeof window === 'undefined'
            ? require('path').resolve('./public/locales')
            : '/public/locales',
};
