import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { settingsSchema } from "@/lib/validators";
import { revalidateHomePage } from "@/lib/revalidation";

export async function GET() {
  const auth = await requireApiAuth(["ADMIN", "EDITOR", "VISUALIZADOR"]);
  if ("response" in auth) return auth.response;

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const payload = await request.json();
  const parsed = settingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await getSiteSettings();
  const updated = await prisma.setting.update({
    where: { id: current.id },
    data: parsed.data,
  });

  revalidateHomePage();

  return NextResponse.json(updated);
}
