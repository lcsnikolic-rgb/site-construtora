import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { revalidateEmpreendimentoPages } from "@/lib/revalidation";

const statusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const parsed = statusSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const current = await prisma.empreendimento.findUnique({ where: { id } });

  if (!current) {
    return NextResponse.json({ error: "Empreendimento não encontrado" }, { status: 404 });
  }

  const updated = await prisma.empreendimento.update({
    where: { id },
    data: {
      status: parsed.data.status,
      publishedAt:
        parsed.data.status === "PUBLISHED"
          ? current.publishedAt ?? new Date()
          : null,
    },
  });

  revalidateEmpreendimentoPages(current.slug);

  return NextResponse.json(updated);
}
