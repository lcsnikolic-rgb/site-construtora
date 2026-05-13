import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { imageKindSchema } from "@/lib/validators";
import { revalidateEmpreendimentoPages } from "@/lib/revalidation";

const createImageSchema = z.object({
  filePath: z.string().trim().min(1),
  title: z.string().trim().min(1),
  caption: z.string().trim().optional().nullable(),
  altText: z.string().trim().optional().nullable(),
  kind: imageKindSchema.default("GALLERY"),
});

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const empreendimento = await prisma.empreendimento.findUnique({ where: { id } });

  if (!empreendimento) {
    return NextResponse.json({ error: "Empreendimento não encontrado" }, { status: 404 });
  }

  const parsed = createImageSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lastImage = await prisma.image.findFirst({
    where: {
      empreendimentoId: id,
      kind: parsed.data.kind,
    },
    orderBy: { sortOrder: "desc" },
  });

  const created = await prisma.image.create({
    data: {
      empreendimentoId: id,
      filePath: parsed.data.filePath,
      title: parsed.data.title,
      caption: parsed.data.caption ?? "",
      altText: parsed.data.altText ?? parsed.data.title,
      kind: parsed.data.kind,
      sortOrder: (lastImage?.sortOrder ?? -1) + 1,
    },
  });

  revalidateEmpreendimentoPages(empreendimento.slug);

  return NextResponse.json(created, { status: 201 });
}
