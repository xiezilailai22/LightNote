/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // 如果需要从外部来源加载图片，在这里添加
  },
};

module.exports = nextConfig; 