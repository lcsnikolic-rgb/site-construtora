import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { reorderImagesSchema } from "@/lib/validators";
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
  const parsed = reorderImagesSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!empreendimento) {
    return NextResponse.json({ error: "Empreendimento não encontrado" }, { status: 404 });
  }

  const images = await prisma.image.findMany({
    where: {
      empreendimentoId: id,
      ...(parsed.data.kind ? { kind: parsed.data.kind } : {}),
    },
    select: { id: true, kind: true },
  });

  const imageIdSet = new Set(images.map((image) => image.id));
  const invalidIds = parsed.data.imageIds.filter((imageId) => !imageIdSet.has(imageId));

  if (invalidIds.length > 0) {
    return NextResponse.json({ error: "Lista de imagens inválida" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.imageIds.map((imageId, index) =>
      prisma.image.update({
        where: { id: imageId },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateEmpreendimentoPages(empreendimento.slug);

  return NextResponse.json({ ok: true });
}
