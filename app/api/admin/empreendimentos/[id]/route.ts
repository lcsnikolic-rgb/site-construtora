import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { serializeDifferentials, serializeStringList } from "@/lib/differentials";
import { empreendimentoSchema } from "@/lib/validators";
import { deletePublicFile } from "@/lib/uploads";
import { revalidateEmpreendimentoPages } from "@/lib/revalidation";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

const empreendimentoInclude = {
  images: {
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function GET(_: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR", "VISUALIZADOR"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: empreendimentoInclude,
  });

  if (!empreendimento) {
    return NextResponse.json({ error: "Empreendimento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(empreendimento);
}

export async function PUT(request: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = empreendimentoSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await prisma.empreendimento.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!current) {
    return NextResponse.json({ error: "Empreendimento não encontrado" }, { status: 404 });
  }

  const oldFilePaths = [current.logoPath, current.coverImagePath, current.pdfPath].filter(
    Boolean,
  ) as string[];

  try {
    const updated = await prisma.empreendimento.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        status: parsed.data.status,
        shortDescription: parsed.data.shortDescription,
        fullDescription: parsed.data.fullDescription,
        conceptText: parsed.data.conceptText || null,
        commercialCalls: serializeStringList(parsed.data.commercialCalls),
        technicalInfo: serializeStringList(parsed.data.technicalInfo),
        institutionalTexts: serializeStringList(parsed.data.institutionalTexts),
        keyHighlights: serializeStringList(parsed.data.keyHighlights),
        convenienceItems: serializeStringList(parsed.data.convenienceItems),
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        location: parsed.data.location,
        logoPath: parsed.data.logoPath || null,
        logoDisplayDurationSeconds: parsed.data.logoDisplayDurationSeconds,
        coverImagePath: parsed.data.coverImagePath || null,
        pdfPath: parsed.data.pdfPath || null,
        differentials: serializeDifferentials(parsed.data.differentials),
        publishedAt:
          parsed.data.status === "PUBLISHED"
            ? current.publishedAt ?? new Date()
            : null,
      },
      include: empreendimentoInclude,
    });

    const newFilePaths = new Set(
      [updated.logoPath, updated.coverImagePath, updated.pdfPath].filter(Boolean) as string[],
    );

    await Promise.all(
      oldFilePaths
        .filter((filePath) => !newFilePaths.has(filePath))
        .map((filePath) => deletePublicFile(filePath)),
    );

    revalidateEmpreendimentoPages(current.slug);
    if (updated.slug !== current.slug) {
      revalidateEmpreendimentoPages(updated.slug);
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
    }

    return NextResponse.json({ error: "Falha ao atualizar empreendimento" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const empreendimento = await prisma.empreendimento.findUnique({
    where: { id },
    include: {
      images: true,
    },
  });

  if (!empreendimento) {
    return NextResponse.json({ error: "Empreendimento não encontrado" }, { status: 404 });
  }

  const filePaths = [
    empreendimento.logoPath,
    empreendimento.coverImagePath,
    empreendimento.pdfPath,
    ...empreendimento.images.map((image) => image.filePath),
  ].filter(Boolean) as string[];

  await prisma.empreendimento.delete({ where: { id } });
  await Promise.all(filePaths.map((filePath) => deletePublicFile(filePath)));

  revalidateEmpreendimentoPages(empreendimento.slug);

  return NextResponse.json({ ok: true });
}
