import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const isUserSite = repositoryName.endsWith(".github.io");

const basePath = isGitHubActions && !isUserSite ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",

  trailingSlash: true,

  basePath,

  images: {
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
