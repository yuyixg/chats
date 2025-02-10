const isDev = process.env?.NODE_ENV === 'development';
console.log('NODE_ENV', process.env?.NODE_ENV);
console.log('-------------------');

const runtimeCaching = [
  {
    urlPattern: /^https?.*\/api\/.*$/i,
    handler: 'NetworkOnly',
    options: {
      cacheName: 'api',
      networkTimeoutSeconds: 15,
    },
  },
  {
    urlPattern: /^https?.*\.(png|jpg|jpeg|svg|gif|webp|avif)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 86400, // 1 天
      },
    },
  },
];

const withPWA = require('next-pwa')({
  dest: 'public',
  register: !isDev,
  skipWaiting: !isDev,
  disable: isDev,
  runtimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  publicRuntimeConfig: {
    chattingIds: {},
    globalConfigs: {},
  },
};

module.exports = withPWA(nextConfig);
