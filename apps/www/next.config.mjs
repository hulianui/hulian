/** @type {import('next').NextConfig} */
const nextConfig = {
  // 工作区包以 TS 源码形式发布，需让 Next 转译
  transpilePackages: ["@hulian/ui", "@hulian/mocks"],
};

export default nextConfig;
