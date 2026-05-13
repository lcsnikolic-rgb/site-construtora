import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { imageMetadataSchema } from "@/lib/validators";
import { deletePublicFile } from "@/lib/uploads";
import { revalidateEmpreendimentoPages } from "@/lib/revalidation";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const parsed = imageMetadataSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await prisma.image.findUnique({
    where: { id },
    include: { empreendimento: { select: { slug: true } } },
  });

  if (!current) {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }

  const updated = await prisma.image.update({
    where: { id },
    data: {
      title: parsed.data.title,
      caption: parsed.data.caption ?? "",
      altText: parsed.data.altText ?? parsed.data.title,
    },
  });

  revalidateEmpreendimentoPages(current.empreendimento.slug);

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const current = await prisma.image.findUnique({
    where: { id },
    include: { empreendimento: { select: { slug: true } } },
  });

  if (!current) {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }

  await prisma.image.delete({ where: { id } });
  await deletePublicFile(current.filePath);

  revalidateEmpreendimentoPages(current.empreendimento.slug);

  return NextResponse.json({ ok: true });
}
