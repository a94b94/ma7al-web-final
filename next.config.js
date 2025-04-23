/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ucarecdn.com', 'images.app.goo.gl'], // ← أضف هنا دومين Google
  },
};

module.exports = nextConfig;
