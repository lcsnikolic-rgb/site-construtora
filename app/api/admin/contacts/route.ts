import { NextResponse } from "next/server";
import { getSiteContact } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { contactSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireApiAuth(["ADMIN", "EDITOR", "VISUALIZADOR"]);
  if ("response" in auth) return auth.response;

  const contact = await getSiteContact();
  return NextResponse.json(contact);
}

export async function PUT(request: Request) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const payload = await request.json();
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await getSiteContact();
  const updated = await prisma.contact.update({
    where: { id: current.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
