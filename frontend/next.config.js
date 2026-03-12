/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: false,
    disable: process.env.NODE_ENV === 'development',
    publicExclusions: ['!noprecache/**/*'],
    buildExclusions: [/middleware-manifest.json$/],
});

const nextConfig = {
    reactStrictMode: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    images: {
        unoptimized: false,
    },
    // Turbopack configuration (required when using webpack plugins like next-pwa)
    turbopack: {},
};

module.exports = withPWA(nextConfig);
