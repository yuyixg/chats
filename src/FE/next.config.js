const isDev = process.env?.NODE_ENV === 'development';
console.log("-------------------");
console.log("NODE_ENV", process.env?.NODE_ENV);
console.log("-------------------");

const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: !isDev,
  skipWaiting: !isDev,
  disable: isDev,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  publicRuntimeConfig: {
    chattingIds: {},
    globalConfigs: {}
  }
};

module.exports = withPWA(nextConfig);
