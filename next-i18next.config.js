module.exports = {
    i18n: {
        defaultLocale: 'zh',
        locales: [
            'en',
            'zh',
        ],
    },
    react: { useSuspense: false },
    localePath:
        typeof window === 'undefined'
            ? require('path').resolve('./public/locales')
            : '/public/locales',
};
