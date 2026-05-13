import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

function normalizeHost(value: string | null) {
  return (value ?? "").split(":")[0]?.trim().toLowerCase() ?? "";
}

function isTailscaleIpHost(host: string) {
  return /^100(?:\.\d{1,3}){3}$/.test(host);
}

const basePath = normalizeBasePath(
  process.env.BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL,
);

const configuredAdminHosts = (process.env.ADMIN_TAILSCALE_HOSTS ?? "")
  .split(",")
  .map((host) => normalizeHost(host))
  .filter(Boolean);

const tailscaleHostFromBaseUrl = normalizeHost(
  (() => {
    try {
      return new URL(
        process.env.BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "",
      ).host;
    } catch {
      return "";
    }
  })(),
);

const allowedAdminHosts = new Set(
  [...configuredAdminHosts, tailscaleHostFromBaseUrl].filter((host) =>
    host.endsWith(".ts.net"),
  ),
);

function stripBasePath(pathname: string) {
  if (!basePath) return pathname;
  if (pathname === basePath) return "/";
  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || "/";
  }

  return pathname;
}

function withBasePath(pathname: string) {
  if (!basePath) return pathname;
  return pathname === "/" ? basePath : `${basePath}${pathname}`;
}

function isAdminSurface(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/auth/")
  );
}

function isTailscaleRequest(req: NextRequest) {
  const host = normalizeHost(req.headers.get("host"));

  return allowedAdminHosts.has(host) || isTailscaleIpHost(host);
}

function forbidden() {
  return new NextResponse("Acesso administrativo permitido somente via Tailscale.", {
    status: 403,
  });
}

export default async function proxy(req: NextRequest) {
  const pathname = stripBasePath(req.nextUrl.pathname);

  if (!isAdminSurface(pathname)) {
    return NextResponse.next();
  }

  if (!isTailscaleRequest(req)) {
    return forbidden();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (pathname === "/admin/login") {
    if (token) {
      return NextResponse.redirect(new URL(withBasePath("/admin"), req.url));
    }

    return NextResponse.next();
  }

  if (!token) {
    const signInUrl = new URL(withBasePath("/admin/login"), req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/admin/usuarios") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL(withBasePath("/admin"), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
