import type { NextConfig } from "next";

function normalizeBasePath(value: string | undefined) {
  if (!value) return "";

  let pathname = value;

  try {
    pathname = new URL(value).pathname;
  } catch {
    pathname = value;
  }

  const normalized = pathname.trim().replace(/\/+$/, "");
  if (!normalized || normalized === "/") return "";

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeAllowedDevOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).hostname;
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");
  }
}

const allowedDevOriginsFromEnv = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map(normalizeAllowedDevOrigin)
  .filter((origin): origin is string => Boolean(origin));

const basePath = normalizeBasePath(
  process.env.BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL,
);

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  async redirects() {
    if (!basePath) return [];

    return [
      {
        source: "/",
        destination: basePath,
        permanent: false,
        basePath: false,
      },
      {
        source: "/admin",
        destination: `${basePath}/admin`,
        permanent: false,
        basePath: false,
      },
      {
        source: "/admin/:path*",
        destination: `${basePath}/admin/:path*`,
        permanent: false,
        basePath: false,
      },
      {
        source: "/api/admin/:path*",
        destination: `${basePath}/api/admin/:path*`,
        permanent: false,
        basePath: false,
      },
      {
        source: "/api/auth/:path*",
        destination: `${basePath}/api/auth/:path*`,
        permanent: false,
        basePath: false,
      },
      {
        source: "/empreendimentos",
        destination: `${basePath}/empreendimentos`,
        permanent: false,
        basePath: false,
      },
      {
        source: "/empreendimentos/:path*",
        destination: `${basePath}/empreendimentos/:path*`,
        permanent: false,
        basePath: false,
      },
      {
        source: "/contato",
        destination: `${basePath}/contato`,
        permanent: false,
        basePath: false,
      },
    ];
  },
  // Allows access to dev assets when the app is opened through local IPs.
  allowedDevOrigins: Array.from(new Set(["*.*.*.*", ...allowedDevOriginsFromEnv])),
};

export default nextConfig;
