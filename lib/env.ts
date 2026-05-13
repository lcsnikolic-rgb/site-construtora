import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  INITIAL_ADMIN_EMAIL: z.string().email().optional(),
  INITIAL_ADMIN_PASSWORD: z.string().min(6).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success && process.env.NODE_ENV === "production") {
  throw new Error(`Variáveis de ambiente inválidas: ${parsedEnv.error.message}`);
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.BASE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  BASE_URL: siteUrl,
  NEXT_PUBLIC_SITE_URL: siteUrl,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? siteUrl,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "dev-only-change-me",
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL ?? "admin@formaespaco.com",
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD ?? "Admin@123",
};
