const { i18n } = require('./next-i18next.config');
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
    chattingIds: {}
  }
};

module.exports = nextConfig;
