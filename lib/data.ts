import { EmpreendimentoStatus } from "@prisma/client";
import type { Contact, Empreendimento, Image, Setting } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type EmpreendimentoWithImages = Empreendimento & {
  images: Image[];
};

type DashboardStats = {
  total: number;
  published: number;
  drafts: number;
  users: number;
};

export async function getSiteSettings(): Promise<Setting> {
  const settings = await prisma.setting.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (settings) {
    return settings;
  }

  return prisma.setting.create({
    data: {
      homeTitle: "Arquitetura corporativa com identidade e alto padrao construtivo",
      homeSubtitle:
        "Empreendimentos concebidos para negocios que valorizam localizacao estrategica, imagem institucional e performance.",
      aboutTitle: "Sobre nos",
      aboutText:
        "A Construtora Forma Espaco desenvolve projetos corporativos com foco em arquitetura contemporanea, eficiencia tecnica e valorizacao patrimonial.",
      primaryButtonLabel: "Ver empreendimentos",
      primaryButtonHref: "/empreendimentos",
      secondaryButtonLabel: "Fale conosco",
      secondaryButtonHref: "/contato",
      homeCarouselIntervalSeconds: 5,
    },
  });
}

export async function getSiteContact(): Promise<Contact> {
  const contact = await prisma.contact.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (contact) {
    return contact;
  }

  return prisma.contact.create({
    data: {
      phone: "(00) 0000-0000",
      whatsapp: "https://wa.me/5500000000000",
      instagram: "https://instagram.com/formaespaco",
      email: "contato@formaespaco.com",
    },
  });
}

export async function getPublishedEmpreendimentos(): Promise<EmpreendimentoWithImages[]> {
  return prisma.empreendimento.findMany({
    where: { status: EmpreendimentoStatus.PUBLISHED },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedEmpreendimentoBySlug(
  slug: string,
): Promise<EmpreendimentoWithImages | null> {
  return prisma.empreendimento.findFirst({
    where: { slug, status: EmpreendimentoStatus.PUBLISHED },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getAdminEmpreendimentos(): Promise<EmpreendimentoWithImages[]> {
  return prisma.empreendimento.findMany({
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const [total, published, drafts, users] = await Promise.all([
    prisma.empreendimento.count(),
    prisma.empreendimento.count({ where: { status: EmpreendimentoStatus.PUBLISHED } }),
    prisma.empreendimento.count({ where: { status: EmpreendimentoStatus.DRAFT } }),
    prisma.user.count(),
  ]);

  return { total, published, drafts, users };
}
