import "dotenv/config";
import bcrypt from "bcrypt";
import path from "path";
import { promises as fs } from "fs";
import { ImageKind, PrismaClient, RoleName } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });
const initialAdminEmail = (process.env.INITIAL_ADMIN_EMAIL ?? "admin@formaespaco.com").toLowerCase();
const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD ?? "Admin@123";

const OFFICIAL_SLUG = "edificio-comercial-maria-clara";
const LEGACY_SLUG = "forma-espaco-prime";

const OFFICIAL_CONTENT = {
  name: "Edificio Comercial Maria Clara",
  shortDescription:
    "Novo marco corporativo em Dourados, com arquitetura contemporanea, localizacao estrategica e estrutura pensada para performance empresarial.",
  conceptText:
    "O Edificio Comercial Maria Clara nasce como um novo marco corporativo em Dourados, unindo arquitetura contemporanea, solucoes inteligentes de engenharia e espacos pensados para empresas que valorizam imagem, eficiencia e crescimento patrimonial.",
  fullDescription:
    "Concebido para quem entende que localizacao e estrutura fazem parte do negocio, o empreendimento esta situado em um dos pontos mais privilegiados do Jardim Europa, com acesso rapido as avenidas Presidente Vargas e Dom Redovino, oferecendo um endereco estrategico conectado aos bairros residenciais e ao principal eixo urbano da cidade. O projeto combina recepcao qualificada, circulacao funcional, business lounge compartilhado, mini market interno e ambientes para reunioes e apresentacoes.",
  location: "Jardim Europa, Dourados - MS (entre Av. Presidente Vargas e Av. Dom Redovino)",
  commercialCalls: [
    "Um novo padrao para o mercado corporativo.",
    "Arquitetura contemporanea que valoriza sua empresa.",
    "Ambiente que traduz profissionalismo.",
    "A primeira impressao que seu negocio merece.",
    "Terreo ativo e funcional.",
    "Convivencia no dia a dia corporativo.",
    "O unico com mini market interno, oferecendo conveniencia total sem precisar sair do edificio.",
    "Business lounge compartilhado.",
    "Para reunioes e encontros com grandes clientes.",
    "Infraestrutura para negocios de grande impacto.",
    "Onde grandes projetos ganham vida.",
    "Bem-estar que impulsiona seus negocios.",
    "Localizacao privilegiada e estrategica.",
    "No principal eixo urbano da cidade.",
  ],
  institutionalTexts: [
    "Arquitetura contemporanea com solucoes inteligentes de engenharia e espacos corporativos de alto nivel.",
    "Empreendimento planejado para empresas que valorizam imagem, eficiencia e crescimento patrimonial.",
    "Endereco estrategico conectado aos bairros residenciais e ao principal eixo urbano da cidade.",
    "Acesso rapido as avenidas Presidente Vargas e Dom Redovino, em regiao valorizada do Jardim Europa.",
    "Ambiente que reforca imagem, conforto e profissionalismo para empresas em crescimento.",
    "Primeira impressao corporativa com recepcao qualificada e organizacao espacial funcional.",
  ],
  keyHighlights: [
    "Espacos pensados para elevar a experiencia corporativa.",
    "Areas dedicadas a reunioes, apresentacoes e encontros profissionais.",
    "Ambiente que reforca imagem, conforto e profissionalismo.",
    "Novo padrao para o mercado corporativo de Dourados.",
    "Localizacao privilegiada com conexao direta ao principal eixo urbano.",
  ],
  technicalInfo: [
    "Planta do 1 ao 6 pavimento.",
    "6 salas corporativas por andar.",
    "Acesso por 2 elevadores sociais.",
    "Salas com areas aproximadas entre 36,93 m2 e 52,32 m2.",
    "Planta do 7 pavimento dedicada ao Business Lounge compartilhado.",
    "Ambientes de reuniao identificados como Reuniao 01, Reuniao 02 e Hall Reuniao no material oficial.",
  ],
  convenienceItems: [
    "Mini Market interno para conveniencia diaria.",
    "Business Lounge compartilhado para reunioes e encontros com clientes.",
    "Hall de reuniao e ambientes de apoio corporativo.",
    "Recepcao corporativa com primeira impressao profissional.",
    "Circulacao interna funcional para operacao diaria.",
  ],
  differentials: [
    "Localizacao em eixo estrategico de Dourados.",
    "Projeto arquitetonico contemporaneo para uso corporativo.",
    "Infraestrutura para reunioes e operacao empresarial de alto nivel.",
    "Conjunto de servicos e conveniencias internas para produtividade.",
  ],
  seoTitle: "Edificio Comercial Maria Clara | Construtora Forma Espaco",
  seoDescription:
    "Conheca o Edificio Comercial Maria Clara: localizacao estrategica, arquitetura contemporanea e infraestrutura corporativa com business lounge e mini market interno.",
  logoPath: "/brand/empreendimentos/edificio-comercial-maria-clara/logo.png",
};

const MARIA_RITA_SLUG = "residencial-maria-rita";
const MARIA_RITA_LEGACY_SLUGS = ["maria-rita", "mariarita", "residencial-mariarita"];

const MARIA_RITA_CONTENT = {
  name: "Residencial Maria Rita",
  shortDescription:
    "Sobrados de alto padrao no Alto das Paineiras, Dourados/MS, com 4 residencias unifamiliares, 2 pavimentos e 141,06 m2 por unidade.",
  conceptText: "Alto padrao para viver com tranquilidade.",
  fullDescription:
    "Conjunto exclusivo com 4 sobrados unifamiliares, em esquina privilegiada no Alto das Paineiras. Planta bem distribuida, com integracao da area social e privacidade no pavimento superior. Arquitetura contemporanea e acabamento de alto padrao.",
  location:
    "Rua Jose de Matos Pereira, esquina com a Rua Portugal - Alto das Paineiras, Dourados/MS - Quadra 17, Lote 11 - CEP 79826-370",
  commercialCalls: [
    "Sobrados de alto padrao | Alto das Paineiras - Dourados/MS.",
    "Alto padrao para viver com tranquilidade.",
    "Arquitetura contemporanea e acabamento de alto padrao.",
    "Um projeto pensado para a rotina de sua familia.",
    "Entrega prevista: junho/2026.",
  ],
  institutionalTexts: [
    "Conjunto exclusivo com 4 sobrados unifamiliares, em esquina privilegiada no Alto das Paineiras.",
    "Planta bem distribuida, com integracao da area social e privacidade no pavimento superior.",
    "Arquitetura contemporanea e acabamento de alto padrao.",
  ],
  keyHighlights: [
    "4 residencias unifamiliares.",
    "2 pavimentos.",
    "141,06 m2 por unidade.",
    "3 suites.",
    "Esquina privilegiada, rua tranquila e calcada ampla.",
  ],
  convenienceItems: [
    "Area gourmet com churrasqueira.",
    "Jardim.",
    "Rua tranquila.",
    "Calcada ampla.",
  ],
  technicalInfo: [
    "Area: 141,06 m2 por unidade.",
    "4 residencias unifamiliares.",
    "Terreo (area social): garagem, sala integrada, lavabo, cozinha, lavanderia, area gourmet e jardim.",
    "Pavimento superior (area intima): 3 suites e hall de circulacao.",
    "Plantas ajustadas para melhor leitura no material oficial.",
    "Telefones no material oficial: (67) 99971-5191 e (67) 98134-2947.",
  ],
  differentials: [
    "141,06 m2 por unidade.",
    "3 suites.",
    "Area gourmet.",
    "Jardim.",
    "Rua tranquila e calcada ampla.",
  ],
  seoTitle: "Residencial Maria Rita | Construtora Forma Espaco",
  seoDescription:
    "Residencial Maria Rita em Dourados/MS: 4 sobrados unifamiliares de alto padrao com 3 suites, area gourmet e jardim.",
};

type SeedImageSpec = {
  sourceFile: string;
  sourceFallbackFiles?: string[];
  targetBaseName: string;
  title: string;
  caption: string;
  altText: string;
  kind: ImageKind;
  sortOrder: number;
};

const MARIA_RITA_IMAGE_SPECS: SeedImageSpec[] = [
  {
    sourceFile: "fachada-diurna.jpg",
    sourceFallbackFiles: [
      "ChatGPT Image 6 de mai. de 2026, 20_15_00.png",
      "ChatGPT Image 6 de mai. de 2026, 20_16_57.png",
    ],
    targetBaseName: "fachada-diurna",
    title: "Fachada | Diurna",
    caption: "Fachada | Diurna",
    altText: "Residencial Maria Rita - fachada diurna",
    kind: "GALLERY",
    sortOrder: 0,
  },
  {
    sourceFile: "fachada-noturna.jpg",
    sourceFallbackFiles: ["ChatGPT Image 6 de mai. de 2026, 20_15_47.png"],
    targetBaseName: "fachada-noturna",
    title: "Fachada | Noturna",
    caption: "Fachada | Noturna",
    altText: "Residencial Maria Rita - fachada noturna",
    kind: "GALLERY",
    sortOrder: 1,
  },
  {
    sourceFile: "planta-terreo.jpg",
    targetBaseName: "planta-terreo",
    title: "Planta | Terreo",
    caption: "Terreo (area social): garagem, sala integrada, lavabo, cozinha, lavanderia, area gourmet e jardim.",
    altText: "Residencial Maria Rita - planta do terreo",
    kind: "FLOOR_PLAN",
    sortOrder: 0,
  },
  {
    sourceFile: "planta-pavimento-superior.jpg",
    targetBaseName: "planta-pavimento-superior",
    title: "Planta | Pavimento superior",
    caption: "Pavimento superior (area intima): 3 suites e hall de circulacao.",
    altText: "Residencial Maria Rita - planta do pavimento superior",
    kind: "FLOOR_PLAN",
    sortOrder: 1,
  },
];

function serializeList(items: string[]) {
  return JSON.stringify(items.map((item) => item.trim()).filter(Boolean));
}

function parseList(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const expanded: string[] = [];

      for (const item of parsed) {
        const text = String(item).trim();
        if (!text) continue;

        const variants = [text];
        if (text.startsWith('"') && text.endsWith('"')) {
          try {
            const unwrapped = JSON.parse(text);
            if (typeof unwrapped === "string" && unwrapped.trim()) {
              variants.push(unwrapped.trim());
            }
          } catch {
            // segue fluxo normal
          }
        }

        let consumedNested = false;
        for (const variant of variants) {
          if (variant.startsWith("[") && variant.endsWith("]")) {
            try {
              const nested = JSON.parse(variant);
              if (Array.isArray(nested)) {
                for (const nestedItem of nested) {
                  const nestedText = String(nestedItem).trim();
                  if (nestedText) expanded.push(nestedText);
                }
                consumedNested = true;
                break;
              }
            } catch {
              // segue fluxo normal
            }
          }
        }

        if (!consumedNested) {
          expanded.push(text);
        }
      }

      return expanded;
    }
  } catch {
    // fallback para dado legado
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueNormalized(values: string[]) {
  const map = new Map<string, string>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalizeForComparison(trimmed);
    if (!map.has(key)) {
      map.set(key, trimmed);
    }
  }

  return Array.from(map.values());
}

function mergeWithOfficial(existingValue: string | null | undefined, officialList: string[]) {
  const existingList = parseList(existingValue);
  const merged = uniqueNormalized([...officialList, ...existingList]);
  return merged;
}

function hasMissingMarkers(text: string | null | undefined, markers: string[]) {
  if (!text) return true;
  const normalized = normalizeForComparison(text);
  return markers.some((marker) => !normalized.includes(normalizeForComparison(marker)));
}

function normalizeForComparison(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_\s.]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function toTitle(filename: string) {
  const base = path.parse(filename).name.replace(/\(\d+\)/g, "").trim();
  const cleaned = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function buildCaptionFromImageTitle(title: string) {
  const normalized = normalizeForComparison(title);

  if (normalized.includes("fachada")) {
    return "Fachada | Um novo padrao para o mercado corporativo.";
  }

  if (normalized.includes("elevador") || normalized.includes("circulacao")) {
    return "Circulacao | Terreo ativo e funcional.";
  }

  if (normalized.includes("minimarket") || normalized.includes("minimarketing")) {
    return "Mini market interno | Conveniencia no dia a dia corporativo.";
  }

  if (normalized.includes("reuniao")) {
    return "Reuniao | Infraestrutura para negocios de grande impacto.";
  }

  if (normalized.includes("espera")) {
    return "Business lounge compartilhado | Para reunioes e encontros com grandes clientes.";
  }

  if (normalized.includes("entrada")) {
    return "Acessos planejados para pedestres e veiculos.";
  }

  if (normalized.includes("planta andares")) {
    return "Planta do 1 ao 6 pavimento | 6 salas corporativas por andar e acesso por 2 elevadores sociais.";
  }

  if (normalized.includes("planta cobertura")) {
    return "Planta do 7 pavimento | Business Lounge compartilhado.";
  }

  if (normalized.includes("planta terreo")) {
    return "Planta tecnica do terreo com circulacao funcional.";
  }

  if (normalized.includes("planta subsolo")) {
    return "Planta tecnica de apoio e acessos complementares.";
  }

  if (normalized.includes("copa")) {
    return "Ambiente de apoio corporativo com foco em bem-estar.";
  }

  return "";
}

function inferImageKindFromValue(value: string): ImageKind {
  const normalized = normalizeForComparison(value);
  const floorPlanTerms = ["planta", "pavimento", "floor-plan", "floorplan", "/plantas/"];
  return floorPlanTerms.some((term) => normalized.includes(term))
    ? "FLOOR_PLAN"
    : "GALLERY";
}

async function pathExists(absolutePath: string) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function ensurePublicFileFromSource(
  sourcePath: string,
  targetFolder: string,
  preferredBaseName?: string,
) {
  if (!(await pathExists(sourcePath))) {
    throw new Error(`Arquivo fonte nao encontrado: ${sourcePath}`);
  }

  const ext = path.extname(sourcePath).toLowerCase();
  const sourceBase = path.basename(sourcePath, ext);
  const base =
    normalizeSegment(preferredBaseName ?? sourceBase) ||
    normalizeSegment(sourceBase) ||
    "arquivo";
  const fileName = `${base}${ext}`;
  const absoluteTargetFolder = path.join(process.cwd(), "public", ...targetFolder.split("/"));
  const absoluteTargetPath = path.join(absoluteTargetFolder, fileName);

  await fs.mkdir(absoluteTargetFolder, { recursive: true });

  let shouldCopy = true;
  if (await pathExists(absoluteTargetPath)) {
    const [sourceStat, targetStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(absoluteTargetPath),
    ]);
    shouldCopy = sourceStat.size !== targetStat.size;
  }

  if (shouldCopy) {
    await fs.copyFile(sourcePath, absoluteTargetPath);
  }

  return `/${path.posix.join(targetFolder, fileName)}`;
}

async function upsertRoles() {
  const roles: Array<{ name: RoleName; label: string }> = [
    { name: "ADMIN", label: "Admin" },
    { name: "EDITOR", label: "Editor" },
    { name: "VISUALIZADOR", label: "Visualizador" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { label: role.label },
      create: role,
    });
  }
}

async function ensureDefaultUsers() {
  const roleByName = new Map((await prisma.role.findMany()).map((role) => [role.name, role.id]));

  const users = [
    {
      name: "Administrador Forma Espaco",
      email: initialAdminEmail,
      password: initialAdminPassword,
      role: "ADMIN" as RoleName,
    },
    {
      name: "Editor Forma Espaco",
      email: "editor@formaespaco.com",
      password: "Editor@123",
      role: "EDITOR" as RoleName,
    },
    {
      name: "Visualizador Forma Espaco",
      email: "viewer@formaespaco.com",
      password: "Viewer@123",
      role: "VISUALIZADOR" as RoleName,
    },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash,
        roleId: roleByName.get(user.role)!,
        isActive: true,
      },
    });
  }
}

async function ensureSiteContent() {
  const existingSetting = await prisma.setting.findFirst();
  if (!existingSetting) {
    await prisma.setting.create({
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

  const existingContact = await prisma.contact.findFirst();
  if (!existingContact) {
    await prisma.contact.create({
      data: {
        phone: "(00) 0000-0000",
        whatsapp: "https://wa.me/5500000000000",
        instagram: "https://instagram.com/formaespaco",
        email: "contato@formaespaco.com",
      },
    });
  }
}

async function buildSeedGallery(
  imageFiles: string[],
  sourceImagesDir: string,
  targetBase: string,
) {
  const nextSortOrderByKind: Record<ImageKind, number> = {
    GALLERY: 0,
    FLOOR_PLAN: 0,
  };
  const data: Array<{
    filePath: string;
    title: string;
    caption: string;
    altText: string;
    kind: ImageKind;
    sortOrder: number;
  }> = [];

  for (const file of imageFiles) {
    const filePath = await ensurePublicFileFromSource(
      path.join(sourceImagesDir, file),
      `${targetBase}/galeria`,
    );
    const title = toTitle(file);
    const kind = inferImageKindFromValue(`${file} ${title}`);

    data.push({
      filePath,
      title,
      caption: buildCaptionFromImageTitle(title),
      altText: title,
      kind,
      sortOrder: nextSortOrderByKind[kind],
    });
    nextSortOrderByKind[kind] += 1;
  }

  return data;
}

function shouldUseOfficialText(current: string | null | undefined, legacyText: string[] = []) {
  if (!current || !current.trim()) return true;
  const normalizedCurrent = normalizeForComparison(current);
  return legacyText.some((item) => normalizeForComparison(item) === normalizedCurrent);
}

async function ensureInitialEmpreendimento() {
  const legacyImagesDir = path.join(process.cwd(), "IMAGENS");
  const mariaClaraImagesDir = path.join(process.cwd(), "IMAGENS_MARIA_CLARA");
  const sourceImagesDir = (await pathExists(legacyImagesDir)) ? legacyImagesDir : mariaClaraImagesDir;
  const sourcePdf = path.join(process.cwd(), "PDF Oficial.pdf");
  const targetBase = `uploads/empreendimentos/${OFFICIAL_SLUG}`;

  const hasSourceImagesDir = await pathExists(sourceImagesDir);
  const hasSourcePdf = await pathExists(sourcePdf);
  const hasBrandLogo = await pathExists(
    path.join(process.cwd(), "public", OFFICIAL_CONTENT.logoPath.replace(/^\//, "")),
  );

  const imageFiles = hasSourceImagesDir
    ? (await fs.readdir(sourceImagesDir))
        .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
        .sort((a, b) => a.localeCompare(b))
    : [];

  const existingByOfficialSlug = await prisma.empreendimento.findUnique({
    where: { slug: OFFICIAL_SLUG },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  const existingByLegacySlug = existingByOfficialSlug
    ? null
    : await prisma.empreendimento.findUnique({
        where: { slug: LEGACY_SLUG },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });

  const existing = existingByOfficialSlug ?? existingByLegacySlug;

  if (!existing) {
    if (imageFiles.length === 0 || !hasSourcePdf) {
      throw new Error(
        "Seed inicial requer IMAGENS/ ou IMAGENS_MARIA_CLARA/ e PDF Oficial.pdf para criar o primeiro empreendimento.",
      );
    }

    const coverFile = imageFiles.find((file) => file.toLowerCase().includes("fachada")) ?? imageFiles[0];
    const coverPath = await ensurePublicFileFromSource(
      path.join(sourceImagesDir, coverFile),
      `${targetBase}/capa`,
      "capa",
    );
    const pdfPath = await ensurePublicFileFromSource(sourcePdf, `${targetBase}/pdf`, "informativo");
    const gallery = await buildSeedGallery(imageFiles, sourceImagesDir, targetBase);

    const empreendimento = await prisma.empreendimento.create({
      data: {
        name: OFFICIAL_CONTENT.name,
        slug: OFFICIAL_SLUG,
        status: "PUBLISHED",
        shortDescription: OFFICIAL_CONTENT.shortDescription,
        fullDescription: OFFICIAL_CONTENT.fullDescription,
        conceptText: OFFICIAL_CONTENT.conceptText,
        commercialCalls: serializeList(OFFICIAL_CONTENT.commercialCalls),
        technicalInfo: serializeList(OFFICIAL_CONTENT.technicalInfo),
        institutionalTexts: serializeList(OFFICIAL_CONTENT.institutionalTexts),
        keyHighlights: serializeList(OFFICIAL_CONTENT.keyHighlights),
        convenienceItems: serializeList(OFFICIAL_CONTENT.convenienceItems),
        seoTitle: OFFICIAL_CONTENT.seoTitle,
        seoDescription: OFFICIAL_CONTENT.seoDescription,
        location: OFFICIAL_CONTENT.location,
        logoPath: hasBrandLogo ? OFFICIAL_CONTENT.logoPath : null,
        logoDisplayDurationSeconds: 3,
        coverImagePath: coverPath,
        pdfPath,
        differentials: serializeList(OFFICIAL_CONTENT.differentials),
        publishedAt: new Date(),
      },
    });

    await prisma.image.createMany({
      data: gallery.map((item) => ({
        empreendimentoId: empreendimento.id,
        filePath: item.filePath,
        title: item.title,
        caption: item.caption,
        altText: item.altText,
        kind: item.kind,
        sortOrder: item.sortOrder,
      })),
    });
    return;
  }

  const updateData: Record<string, unknown> = {};

  const officialSlugAlreadyExists = existing.slug !== OFFICIAL_SLUG
    ? await prisma.empreendimento.findUnique({ where: { slug: OFFICIAL_SLUG }, select: { id: true } })
    : null;

  if (existing.slug === LEGACY_SLUG && !officialSlugAlreadyExists) {
    updateData.slug = OFFICIAL_SLUG;
  }

  if (shouldUseOfficialText(existing.name, ["Forma Espaco Prime"])) {
    updateData.name = OFFICIAL_CONTENT.name;
  }

  if (
    shouldUseOfficialText(existing.shortDescription, [
      "Empreendimento corporativo com arquitetura contemporanea, circulacao inteligente e areas comuns qualificadas.",
    ])
  ) {
    updateData.shortDescription = OFFICIAL_CONTENT.shortDescription;
  }

  if (
    shouldUseOfficialText(existing.fullDescription, [
      "O Forma Espaco Prime foi concebido para entregar funcionalidade, presenca arquitetonica e qualidade de uso. O projeto reune solucoes de acesso, areas de convivencia e composicao espacial voltada para produtividade e conforto.",
    ])
  ) {
    updateData.fullDescription = OFFICIAL_CONTENT.fullDescription;
  }

  if (
    !existing.conceptText ||
    hasMissingMarkers(existing.conceptText, ["marco corporativo em dourados", "crescimento patrimonial"])
  ) {
    updateData.conceptText = OFFICIAL_CONTENT.conceptText;
  }

  if (
    !existing.fullDescription ||
    hasMissingMarkers(existing.fullDescription, [
      "jardim europa",
      "avenidas presidente vargas e dom redovino",
      "principal eixo urbano da cidade",
    ])
  ) {
    updateData.fullDescription = OFFICIAL_CONTENT.fullDescription;
  }

  if (!existing.location || existing.location === "Localizacao em atualizacao no painel administrativo") {
    updateData.location = OFFICIAL_CONTENT.location;
  }
  if (!existing.seoTitle) updateData.seoTitle = OFFICIAL_CONTENT.seoTitle;
  if (!existing.seoDescription) updateData.seoDescription = OFFICIAL_CONTENT.seoDescription;
  if (
    hasBrandLogo &&
    (!existing.logoPath ||
      existing.logoPath === "/brand/logo-maria-clara.png" ||
      existing.logoPath.includes("/uploads/empreendimentos/forma-espaco-prime/logo/"))
  ) {
    updateData.logoPath = OFFICIAL_CONTENT.logoPath;
  }

  const mergedCommercialCalls = mergeWithOfficial(
    existing.commercialCalls,
    OFFICIAL_CONTENT.commercialCalls,
  );
  if (JSON.stringify(parseList(existing.commercialCalls)) !== JSON.stringify(mergedCommercialCalls)) {
    updateData.commercialCalls = serializeList(mergedCommercialCalls);
  }

  const mergedTechnicalInfo = mergeWithOfficial(existing.technicalInfo, OFFICIAL_CONTENT.technicalInfo);
  if (JSON.stringify(parseList(existing.technicalInfo)) !== JSON.stringify(mergedTechnicalInfo)) {
    updateData.technicalInfo = serializeList(mergedTechnicalInfo);
  }

  const mergedInstitutionalTexts = mergeWithOfficial(
    existing.institutionalTexts,
    OFFICIAL_CONTENT.institutionalTexts,
  );
  if (JSON.stringify(parseList(existing.institutionalTexts)) !== JSON.stringify(mergedInstitutionalTexts)) {
    updateData.institutionalTexts = serializeList(mergedInstitutionalTexts);
  }

  const mergedKeyHighlights = mergeWithOfficial(existing.keyHighlights, OFFICIAL_CONTENT.keyHighlights);
  if (JSON.stringify(parseList(existing.keyHighlights)) !== JSON.stringify(mergedKeyHighlights)) {
    updateData.keyHighlights = serializeList(mergedKeyHighlights);
  }

  const mergedConvenienceItems = mergeWithOfficial(
    existing.convenienceItems,
    OFFICIAL_CONTENT.convenienceItems,
  );
  if (JSON.stringify(parseList(existing.convenienceItems)) !== JSON.stringify(mergedConvenienceItems)) {
    updateData.convenienceItems = serializeList(mergedConvenienceItems);
  }

  const mergedDifferentials = mergeWithOfficial(existing.differentials, OFFICIAL_CONTENT.differentials);
  const hasNestedLegacyDifferentials = /\\\"\[|"\[/.test(existing.differentials ?? "");
  if (
    hasNestedLegacyDifferentials ||
    JSON.stringify(parseList(existing.differentials)) !== JSON.stringify(mergedDifferentials)
  ) {
    updateData.differentials = serializeList(mergedDifferentials);
  }

  if (imageFiles.length > 0 && !existing.coverImagePath) {
    const coverFile = imageFiles.find((file) => file.toLowerCase().includes("fachada")) ?? imageFiles[0];
    updateData.coverImagePath = await ensurePublicFileFromSource(
      path.join(sourceImagesDir, coverFile),
      `${targetBase}/capa`,
      "capa",
    );
  }

  if (hasSourcePdf && !existing.pdfPath) {
    updateData.pdfPath = await ensurePublicFileFromSource(
      sourcePdf,
      `${targetBase}/pdf`,
      "informativo",
    );
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.empreendimento.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  if (existing.images.length === 0 && imageFiles.length > 0) {
    const gallery = await buildSeedGallery(imageFiles, sourceImagesDir, targetBase);
    await prisma.image.createMany({
      data: gallery.map((item) => ({
        empreendimentoId: existing.id,
        filePath: item.filePath,
        title: item.title,
        caption: item.caption,
        altText: item.altText,
        kind: item.kind,
        sortOrder: item.sortOrder,
      })),
    });
  } else if (existing.images.length > 0) {
    const sortCounters: Record<ImageKind, number> = {
      GALLERY: 0,
      FLOOR_PLAN: 0,
    };

    for (const image of existing.images) {
      const suggestedCaption = buildCaptionFromImageTitle(image.title);
      const inferredKind = inferImageKindFromValue(`${image.title} ${image.filePath}`);
      const hasMeaningfulCaption = image.caption && image.caption.trim().length > 0;
      const nextSortOrder = sortCounters[inferredKind];
      sortCounters[inferredKind] += 1;

      const data: {
        caption?: string;
        kind?: ImageKind;
        altText?: string;
        sortOrder?: number;
      } = {};

      if (!hasMeaningfulCaption && suggestedCaption) {
        data.caption = suggestedCaption;
      }

      if (image.kind !== inferredKind) {
        data.kind = inferredKind;
      }

      if (!image.altText || !image.altText.trim()) {
        data.altText = image.title;
      }

      if (image.sortOrder !== nextSortOrder) {
        data.sortOrder = nextSortOrder;
      }

      if (Object.keys(data).length === 0) {
        continue;
      }

      await prisma.image.update({
        where: { id: image.id },
        data,
      });
    }
  }
}

async function resolveMariaRitaSourceFile(
  sourceImagesDir: string,
  sourceFile: string,
  sourceFallbackFiles: string[] = [],
) {
  for (const file of [sourceFile, ...sourceFallbackFiles]) {
    const absolutePath = path.join(sourceImagesDir, file);
    if (await pathExists(absolutePath)) {
      return absolutePath;
    }
  }

  return null;
}

async function ensureMariaRitaEmpreendimento() {
  const sourceImagesDir = path.join(process.cwd(), "IMAGENS_MARIA_RITA");
  const sourcePdf = path.join(process.cwd(), "PDF Maria Rita.pdf");
  const targetBase = `uploads/empreendimentos/${MARIA_RITA_SLUG}`;

  if (!(await pathExists(sourceImagesDir))) {
    throw new Error(
      "Seed do Residencial Maria Rita requer a pasta IMAGENS_MARIA_RITA com os arquivos oficiais.",
    );
  }

  if (!(await pathExists(sourcePdf))) {
    throw new Error(
      "Seed do Residencial Maria Rita requer o arquivo PDF Maria Rita.pdf na raiz do projeto.",
    );
  }

  const resolvedSourceBySpec = new Map<SeedImageSpec, string>();
  const missingFiles: string[] = [];

  for (const spec of MARIA_RITA_IMAGE_SPECS) {
    const resolvedSource = await resolveMariaRitaSourceFile(
      sourceImagesDir,
      spec.sourceFile,
      spec.sourceFallbackFiles,
    );

    if (resolvedSource) {
      resolvedSourceBySpec.set(spec, resolvedSource);
    } else {
      missingFiles.push(spec.sourceFile);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(
      `Arquivos obrigatorios do Maria Rita ausentes em IMAGENS_MARIA_RITA: ${missingFiles.join(", ")}`,
    );
  }

  const expectedImages = [];
  for (const spec of MARIA_RITA_IMAGE_SPECS) {
    const folder = spec.kind === "FLOOR_PLAN" ? `${targetBase}/plantas` : `${targetBase}/galeria`;
    const resolvedSource = resolvedSourceBySpec.get(spec);
    if (!resolvedSource) continue;

    const filePath = await ensurePublicFileFromSource(
      resolvedSource,
      folder,
      spec.targetBaseName,
    );

    expectedImages.push({
      filePath,
      title: spec.title,
      caption: spec.caption,
      altText: spec.altText,
      kind: spec.kind,
      sortOrder: spec.sortOrder,
    });
  }

  const coverSource =
    (await resolveMariaRitaSourceFile(sourceImagesDir, "fachada-diurna-cover.png", [
      "ChatGPT Image 6 de mai. de 2026, 20_16_57.png",
      "fachada-diurna.jpg",
      "ChatGPT Image 6 de mai. de 2026, 20_15_00.png",
    ])) ?? resolvedSourceBySpec.get(MARIA_RITA_IMAGE_SPECS[0]);

  if (!coverSource) {
    throw new Error("Seed do Residencial Maria Rita nao encontrou imagem de capa.");
  }

  const coverPath = await ensurePublicFileFromSource(
    coverSource,
    `${targetBase}/capa`,
    "capa",
  );
  const pdfPath = await ensurePublicFileFromSource(sourcePdf, `${targetBase}/pdf`, "informativo");

  let existing: { id: string; slug: string; logoPath: string | null } | null = null;
  for (const slug of [MARIA_RITA_SLUG, ...MARIA_RITA_LEGACY_SLUGS]) {
    existing = await prisma.empreendimento.findUnique({
      where: { slug },
      select: { id: true, slug: true, logoPath: true },
    });
    if (existing) break;
  }

  if (!existing) {
    const created = await prisma.empreendimento.create({
      data: {
        name: MARIA_RITA_CONTENT.name,
        slug: MARIA_RITA_SLUG,
        status: "DRAFT",
        shortDescription: MARIA_RITA_CONTENT.shortDescription,
        fullDescription: MARIA_RITA_CONTENT.fullDescription,
        conceptText: MARIA_RITA_CONTENT.conceptText,
        commercialCalls: serializeList(MARIA_RITA_CONTENT.commercialCalls),
        technicalInfo: serializeList(MARIA_RITA_CONTENT.technicalInfo),
        institutionalTexts: serializeList(MARIA_RITA_CONTENT.institutionalTexts),
        keyHighlights: serializeList(MARIA_RITA_CONTENT.keyHighlights),
        convenienceItems: serializeList(MARIA_RITA_CONTENT.convenienceItems),
        seoTitle: MARIA_RITA_CONTENT.seoTitle,
        seoDescription: MARIA_RITA_CONTENT.seoDescription,
        location: MARIA_RITA_CONTENT.location,
        logoPath: null,
        logoDisplayDurationSeconds: 3,
        coverImagePath: coverPath,
        pdfPath,
        differentials: serializeList(MARIA_RITA_CONTENT.differentials),
        publishedAt: null,
      },
    });

    await prisma.image.createMany({
      data: expectedImages.map((image) => ({
        empreendimentoId: created.id,
        filePath: image.filePath,
        title: image.title,
        caption: image.caption,
        altText: image.altText,
        kind: image.kind,
        sortOrder: image.sortOrder,
      })),
    });

    return;
  }

  const updateData: Record<string, unknown> = {
    name: MARIA_RITA_CONTENT.name,
    shortDescription: MARIA_RITA_CONTENT.shortDescription,
    fullDescription: MARIA_RITA_CONTENT.fullDescription,
    conceptText: MARIA_RITA_CONTENT.conceptText,
    commercialCalls: serializeList(MARIA_RITA_CONTENT.commercialCalls),
    technicalInfo: serializeList(MARIA_RITA_CONTENT.technicalInfo),
    institutionalTexts: serializeList(MARIA_RITA_CONTENT.institutionalTexts),
    keyHighlights: serializeList(MARIA_RITA_CONTENT.keyHighlights),
    convenienceItems: serializeList(MARIA_RITA_CONTENT.convenienceItems),
    seoTitle: MARIA_RITA_CONTENT.seoTitle,
    seoDescription: MARIA_RITA_CONTENT.seoDescription,
    location: MARIA_RITA_CONTENT.location,
    coverImagePath: coverPath,
    pdfPath,
    differentials: serializeList(MARIA_RITA_CONTENT.differentials),
    logoPath: existing.logoPath ?? null,
  };

  if (existing.slug !== MARIA_RITA_SLUG) {
    const canonicalSlugInUse = await prisma.empreendimento.findUnique({
      where: { slug: MARIA_RITA_SLUG },
      select: { id: true },
    });
    if (!canonicalSlugInUse || canonicalSlugInUse.id === existing.id) {
      updateData.slug = MARIA_RITA_SLUG;
    }
  }

  await prisma.empreendimento.update({
    where: { id: existing.id },
    data: updateData,
  });

  const refreshedImages = await prisma.image.findMany({
    where: { empreendimentoId: existing.id },
    orderBy: [{ createdAt: "asc" }],
  });

  const foreignImageIds = refreshedImages
    .filter((image) => {
      const normalizedPath = normalizeForComparison(image.filePath);
      return (
        normalizedPath.includes("/forma-espaco-prime/") ||
        normalizedPath.includes("/edificio-comercial-maria-clara/")
      );
    })
    .map((image) => image.id);
  if (foreignImageIds.length > 0) {
    await prisma.image.deleteMany({
      where: {
        id: { in: foreignImageIds },
      },
    });
  }

  for (const expected of expectedImages) {
    const matches = refreshedImages.filter((image) => image.filePath === expected.filePath);
    const primary = matches[0];

    if (!primary) {
      await prisma.image.create({
        data: {
          empreendimentoId: existing.id,
          filePath: expected.filePath,
          title: expected.title,
          caption: expected.caption,
          altText: expected.altText,
          kind: expected.kind,
          sortOrder: expected.sortOrder,
        },
      });
      continue;
    }

    await prisma.image.update({
      where: { id: primary.id },
      data: {
        title: expected.title,
        caption: expected.caption,
        altText: expected.altText,
        kind: expected.kind,
        sortOrder: expected.sortOrder,
      },
    });

    if (matches.length > 1) {
      await prisma.image.deleteMany({
        where: {
          id: {
            in: matches.slice(1).map((image) => image.id),
          },
        },
      });
    }
  }
}

async function main() {
  await upsertRoles();
  await ensureDefaultUsers();
  await ensureSiteContent();
  await ensureInitialEmpreendimento();
  await ensureMariaRitaEmpreendimento();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
