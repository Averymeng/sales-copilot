/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // db/seed 内含 csv，构建时跳过类型检查
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
