function normalizeBasePath(value: string | undefined) {
  const trimmed = value?.trim().replace(/\/+$/, "") ?? "";
  if (!trimmed || trimmed === "/") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export const appBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export function appPath(path: string) {
  if (!path || !path.startsWith("/")) return path;
  if (!appBasePath || path === appBasePath || path.startsWith(`${appBasePath}/`)) {
    return path;
  }

  return `${appBasePath}${path}`;
}

export function apiPath(path: string) {
  return appPath(path);
}

function isAbsoluteAssetPath(path: string) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(path) || path.startsWith("data:");
}

export function normalizePublicAssetPath(path: string | null | undefined) {
  const trimmed = path?.trim() ?? "";
  if (!trimmed) return "";
  if (isAbsoluteAssetPath(trimmed)) return trimmed;

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (appBasePath && withLeadingSlash.startsWith(`${appBasePath}/`)) {
    return withLeadingSlash.slice(appBasePath.length) || "/";
  }

  return withLeadingSlash;
}

export function publicPath(path: string | null | undefined) {
  const normalizedPath = normalizePublicAssetPath(path);
  return normalizedPath ? appPath(normalizedPath) : "";
}

export function routePath(path: string | null) {
  if (!path || !appBasePath) return path ?? "";
  if (path === appBasePath) return "/";
  if (path.startsWith(`${appBasePath}/`)) {
    return path.slice(appBasePath.length) || "/";
  }

  return path;
}
