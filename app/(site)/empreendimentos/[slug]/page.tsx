import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EmpreendimentoLogoOverlay } from "@/components/site/EmpreendimentoLogoOverlay";
import { FloorPlanGallery } from "@/components/site/FloorPlanGallery";
import { ImmersiveGallery } from "@/components/site/ImmersiveGallery";
import { RevealSection } from "@/components/site/RevealSection";
import {
  getPublishedEmpreendimentoBySlug,
  getSiteContact,
} from "@/lib/data";
import type { EmpreendimentoWithImages } from "@/lib/data";
import { parseDifferentials, parseStringList } from "@/lib/differentials";
import { normalizePublicAssetPath, publicPath } from "@/lib/paths";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ResolvedLogoParams = {
  slug: string;
  configuredPath: string | null;
};

type EmpreendimentoImage = EmpreendimentoWithImages["images"][number];

async function publicAssetExists(relativePath: string) {
  const normalizedPath = normalizePublicAssetPath(relativePath);
  const normalized = normalizedPath.replace(/^\//, "");
  if (!normalized) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(normalizedPath)) return false;

  try {
    await fs.access(path.join(process.cwd(), "public", ...normalized.split("/")));
    return true;
  } catch {
    return false;
  }
}

async function findLogoByConvention(slug: string) {
  const brandFolderPath = path.join(process.cwd(), "public", "brand", "empreendimentos", slug);
  const allowedExtensions = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp"]);

  try {
    const entries = await fs.readdir(brandFolderPath, { withFileTypes: true });
    const logoFile = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => allowedExtensions.has(path.extname(fileName).toLowerCase()))
      .find((fileName) => fileName.toLowerCase().includes("logo"));

    return logoFile ? `/brand/empreendimentos/${slug}/${logoFile}` : null;
  } catch {
    return null;
  }
}

async function resolveEmpreendimentoLogoPath({
  slug,
  configuredPath,
}: ResolvedLogoParams) {
  const normalizedConfiguredPath = normalizePublicAssetPath(configuredPath);
  const conventionSvg = `/brand/empreendimentos/${slug}/logo.svg`;
  const conventionPng = `/brand/empreendimentos/${slug}/logo.png`;

  if (normalizedConfiguredPath && (await publicAssetExists(normalizedConfiguredPath))) {
    return normalizedConfiguredPath;
  }

  if (normalizedConfiguredPath) {
    const candidateSvg = normalizedConfiguredPath.replace(/\.[^/.]+$/i, ".svg");
    if (candidateSvg !== normalizedConfiguredPath && (await publicAssetExists(candidateSvg))) {
      return candidateSvg;
    }
  }

  if (await publicAssetExists(conventionSvg)) {
    return conventionSvg;
  }

  if (await publicAssetExists(conventionPng)) {
    return conventionPng;
  }

  const discoveredLogoPath = await findLogoByConvention(slug);
  if (discoveredLogoPath) {
    return discoveredLogoPath;
  }

  return normalizedConfiguredPath;
}

function compactList(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function normalizedForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesAnyTerm(value: string, terms: string[]) {
  const normalized = normalizedForSearch(value);
  return terms.some((term) => normalized.includes(normalizedForSearch(term)));
}

function distributeInColumns(values: string[], columns: number) {
  if (values.length === 0) return [];
  const columnCount = Math.max(columns, 1);
  const size = Math.ceil(values.length / columnCount);
  const groups: string[][] = [];

  for (let index = 0; index < values.length; index += size) {
    groups.push(values.slice(index, index + size));
  }

  return groups;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const empreendimento = await getPublishedEmpreendimentoBySlug(slug);

  if (!empreendimento) {
    return {
      title: "Empreendimento",
    };
  }

  return {
    title: empreendimento.seoTitle || empreendimento.name,
    description: empreendimento.seoDescription || empreendimento.shortDescription,
  };
}

export default async function EmpreendimentoPage({ params }: PageProps) {
  const { slug } = await params;

  const [empreendimento, contact] = await Promise.all([
    getPublishedEmpreendimentoBySlug(slug),
    getSiteContact(),
  ]);

  if (!empreendimento) {
    notFound();
  }

  const differentials = parseDifferentials(empreendimento.differentials);
  const commercialCalls = parseStringList(empreendimento.commercialCalls);
  const technicalInfo = parseStringList(empreendimento.technicalInfo);
  const institutionalTexts = parseStringList(empreendimento.institutionalTexts);
  const keyHighlights = parseStringList(empreendimento.keyHighlights);
  const convenienceItems = parseStringList(empreendimento.convenienceItems);
  const galleryOnlyImages = empreendimento.images
    .filter((image: EmpreendimentoImage) => image.kind === "GALLERY")
    .sort((a: EmpreendimentoImage, b: EmpreendimentoImage) => a.sortOrder - b.sortOrder);
  const floorPlanOnlyImages = empreendimento.images
    .filter((image: EmpreendimentoImage) => image.kind === "FLOOR_PLAN")
    .sort((a: EmpreendimentoImage, b: EmpreendimentoImage) => a.sortOrder - b.sortOrder);
  const visualImages = galleryOnlyImages.length > 0 ? galleryOnlyImages : empreendimento.images;
  const heroImage = empreendimento.coverImagePath ?? visualImages[0]?.filePath ?? null;
  const architectureImage =
    visualImages[1]?.filePath ??
    visualImages[0]?.filePath ??
    empreendimento.coverImagePath ??
    null;
  const convenienceImage =
    visualImages[2]?.filePath ??
    visualImages[1]?.filePath ??
    visualImages[0]?.filePath ??
    null;
  const locationImage =
    visualImages.find((image: EmpreendimentoImage) =>
      matchesAnyTerm(`${image.title} ${image.caption ?? ""}`, [
        "fachada",
        "entrada",
        "localizacao",
        "acesso",
      ]),
    )?.filePath ??
    heroImage;

  const manifestoParagraphs = compactList(
    [empreendimento.conceptText ?? "", empreendimento.fullDescription].filter(Boolean),
  );
  const narrativePhrase =
    commercialCalls[0] || keyHighlights[0] || empreendimento.shortDescription;
  const highlights = compactList([...keyHighlights, ...differentials]);
  const commercialNarratives = compactList(commercialCalls);
  const architectureTexts =
    institutionalTexts.length > 0 ? institutionalTexts : manifestoParagraphs;
  const locationAccessTexts = compactList([
    empreendimento.location,
    ...institutionalTexts.filter((item) =>
      matchesAnyTerm(item, [
        "localizacao",
        "endereco",
        "jardim europa",
        "presidente vargas",
        "dom redovino",
        "eixo urbano",
        "acesso",
      ]),
    ),
    ...commercialCalls.filter((item) =>
      matchesAnyTerm(item, ["localizacao", "eixo urbano", "acesso"]),
    ),
  ]);
  const convenienceList =
    convenienceItems.length > 0
      ? convenienceItems
      : compactList([...commercialCalls, ...differentials]).slice(0, 8);
  const technicalColumns = distributeInColumns(technicalInfo, 2);
  const planCards = floorPlanOnlyImages.map((image: EmpreendimentoImage) => ({
    id: image.id,
    src: image.filePath,
    alt: image.altText || image.title,
    caption: image.caption || image.title,
  }));
  const hasPlanCards = planCards.length > 0;
  const hasTechnicalInfo = technicalColumns.some((column) => column.length > 0);

  const logoPath = await resolveEmpreendimentoLogoPath({
    slug: empreendimento.slug,
    configuredPath: empreendimento.logoPath,
  });

  const galleryImages = visualImages.map((image: EmpreendimentoImage) => ({
    id: image.id,
    src: image.filePath,
    alt: image.altText || image.title,
    caption: image.caption || image.title,
  }));

  return (
    <main className="premium-project-page">
      {logoPath ? (
        <EmpreendimentoLogoOverlay
          key={`${empreendimento.slug}-${logoPath}`}
          logoPath={logoPath}
          durationSeconds={empreendimento.logoDisplayDurationSeconds}
        />
      ) : null}

      <section className="premium-hero">
        {heroImage ? (
          <Image
            src={publicPath(heroImage)}
            alt={empreendimento.name}
            fill
            priority
            sizes="100vw"
            className="premium-hero-image"
          />
        ) : null}
        <div className="premium-hero-overlay" aria-hidden="true" />
        <div className="premium-hero-content">
          <p className="premium-hero-kicker">{empreendimento.location}</p>
          <h1>{empreendimento.name}</h1>
          <p className="premium-hero-phrase">{narrativePhrase}</p>
        </div>
      </section>

      <div className="container premium-content-stack">
        <RevealSection className="premium-section premium-manifesto" delayMs={40}>
          <p className="premium-section-label">Conceito</p>
          <h2>Manifesto do empreendimento</h2>
          <div className="premium-manifesto-text">
            {manifestoParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="premium-section premium-highlights" delayMs={80}>
          <p className="premium-section-label">Destaques principais</p>
          <h2>Pontos de valor do projeto</h2>
          <div className="premium-highlight-grid">
            {highlights.map((item, index) => (
              <article key={item} className="premium-highlight-card">
                <span className="premium-highlight-icon">{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>

          {commercialNarratives.length > 0 ? (
            <div className="premium-commercial-strip" aria-label="Chamadas comerciais">
              {commercialNarratives.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : null}
        </RevealSection>

        <RevealSection className="premium-section premium-architecture" delayMs={120}>
          <p className="premium-section-label">Arquitetura / Design</p>
          <h2>Arquitetura corporativa com identidade contemporanea</h2>
          <div className="premium-architecture-grid">
            <div className="premium-architecture-texts">
              {architectureTexts.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {architectureImage ? (
              <figure className="premium-architecture-image">
                <Image
                  src={publicPath(architectureImage)}
                  alt={`Arquitetura do ${empreendimento.name}`}
                  fill
                  sizes="(max-width: 920px) 100vw, 42vw"
                />
              </figure>
            ) : null}
          </div>
        </RevealSection>

        <RevealSection className="premium-section premium-location" delayMs={130}>
          <p className="premium-section-label">Localizacao e acessos</p>
          <h2>Jardim Europa, Dourados, no principal eixo urbano da cidade</h2>
          <div className="premium-architecture-grid">
            <ul className="premium-location-list">
              {locationAccessTexts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {locationImage ? (
              <figure className="premium-architecture-image">
                <Image
                  src={publicPath(locationImage)}
                  alt={`Localizacao e acessos do ${empreendimento.name}`}
                  fill
                  sizes="(max-width: 920px) 100vw, 42vw"
                />
              </figure>
            ) : null}
          </div>
        </RevealSection>

        <RevealSection className="premium-section premium-convenience" delayMs={140}>
          <p className="premium-section-label">Conveniencia / Estrutura</p>
          <h2>Facilidades para o dia a dia corporativo</h2>
          <div className="premium-convenience-grid">
            <ul>
              {convenienceList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {convenienceImage ? (
              <figure className="premium-convenience-image">
                <Image
                  src={publicPath(convenienceImage)}
                  alt={`Estrutura interna do ${empreendimento.name}`}
                  fill
                  sizes="(max-width: 920px) 100vw, 42vw"
                />
              </figure>
            ) : null}
          </div>
        </RevealSection>

        <RevealSection className="premium-section premium-gallery" delayMs={160}>
          <p className="premium-section-label">Galeria imersiva</p>
          <h2>Experiencia visual do empreendimento</h2>
          <ImmersiveGallery empreendimentoName={empreendimento.name} images={galleryImages} />
        </RevealSection>

        <section className="premium-section premium-technical">
          <p className="premium-section-label">Plantas dos Pavimentos</p>

          {hasPlanCards ? (
            <FloorPlanGallery empreendimentoName={empreendimento.name} images={planCards} />
          ) : (
            <p className="premium-empty-state">
              Imagens de plantas em atualizacao. As informacoes tecnicas seguem disponiveis abaixo.
            </p>
          )}

          {hasTechnicalInfo ? (
            <div className="premium-technical-grid">
              {technicalColumns.map((column, index) => (
                <ul key={`col-${index}`} className="premium-technical-list">
                  {column.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ))}
            </div>
          ) : null}
        </section>

        <RevealSection className="premium-section premium-cta" delayMs={200}>
          <p className="premium-section-label">Atendimento</p>
          <div className="premium-cta-row">
            <h2>Fale com um especialista</h2>
            <a className="btn btn-primary premium-btn" href={contact.whatsapp} target="_blank" rel="noreferrer">
              Fale com um especialista
            </a>
          </div>
        </RevealSection>
      </div>
    </main>
  );
}
