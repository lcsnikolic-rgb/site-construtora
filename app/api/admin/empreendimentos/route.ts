import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { serializeDifferentials, serializeStringList } from "@/lib/differentials";
import { empreendimentoSchema } from "@/lib/validators";
import { revalidateEmpreendimentoPages } from "@/lib/revalidation";

const empreendimentoInclude = {
  images: {
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function GET() {
  const auth = await requireApiAuth(["ADMIN", "EDITOR", "VISUALIZADOR"]);
  if ("response" in auth) return auth.response;

  const empreendimentos = await prisma.empreendimento.findMany({
    include: empreendimentoInclude,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(empreendimentos);
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const payload = await request.json();
  const parsed = empreendimentoSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.empreendimento.create({
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
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
      include: empreendimentoInclude,
    });

    revalidateEmpreendimentoPages(created.slug);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
    }

    return NextResponse.json({ error: "Falha ao criar empreendimento" }, { status: 500 });
  }
}
