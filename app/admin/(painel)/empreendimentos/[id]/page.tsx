import { notFound } from "next/navigation";
import { EmpreendimentoForm } from "@/components/admin/EmpreendimentoForm";
import { parseDifferentials, parseStringList } from "@/lib/differentials";
import { canEditContent } from "@/lib/rbac";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEmpreendimentoEditPage({ params }: PageProps) {
  const { id } = await params;
  const [session, empreendimento] = await Promise.all([
    getAuthSession(),
    prisma.empreendimento.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  if (!empreendimento) {
    notFound();
  }

  const canEdit = session?.user ? canEditContent(session.user.role) : false;
  const differentials = parseDifferentials(empreendimento.differentials);
  const commercialCalls = parseStringList(empreendimento.commercialCalls);
  const technicalInfo = parseStringList(empreendimento.technicalInfo);
  const institutionalTexts = parseStringList(empreendimento.institutionalTexts);
  const keyHighlights = parseStringList(empreendimento.keyHighlights);
  const convenienceItems = parseStringList(empreendimento.convenienceItems);

  return (
    <EmpreendimentoForm
      mode="edit"
      canEdit={canEdit}
      initialData={{
        id: empreendimento.id,
        name: empreendimento.name,
        slug: empreendimento.slug,
        status: empreendimento.status,
        shortDescription: empreendimento.shortDescription,
        fullDescription: empreendimento.fullDescription,
        conceptText: empreendimento.conceptText ?? "",
        commercialCalls: commercialCalls.length > 0 ? commercialCalls : [""],
        technicalInfo: technicalInfo.length > 0 ? technicalInfo : [""],
        institutionalTexts: institutionalTexts.length > 0 ? institutionalTexts : [""],
        keyHighlights: keyHighlights.length > 0 ? keyHighlights : [""],
        convenienceItems: convenienceItems.length > 0 ? convenienceItems : [""],
        seoTitle: empreendimento.seoTitle ?? "",
        seoDescription: empreendimento.seoDescription ?? "",
        location: empreendimento.location,
        logoPath: empreendimento.logoPath ?? "",
        logoDisplayDurationSeconds: empreendimento.logoDisplayDurationSeconds,
        coverImagePath: empreendimento.coverImagePath ?? "",
        pdfPath: empreendimento.pdfPath ?? "",
        differentials: differentials.length > 0 ? differentials : [""],
        images: empreendimento.images.map((image) => ({
          id: image.id,
          filePath: image.filePath,
          title: image.title,
          caption: image.caption ?? "",
          altText: image.altText ?? image.title,
          kind: image.kind,
          sortOrder: image.sortOrder,
        })),
      }}
    />
  );
}
