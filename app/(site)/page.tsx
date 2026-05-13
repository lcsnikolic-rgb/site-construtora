import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { getPublishedEmpreendimentos, getSiteSettings } from "@/lib/data";
import { publicPath } from "@/lib/paths";

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isTechnicalHeroImage(path: string) {
  const normalized = normalizeForSearch(path);
  return ["planta", "pavimento", "subsolo", "floor"].some((term) => normalized.includes(term));
}

export default async function HomePage() {
  const [settings, empreendimentos] = await Promise.all([
    getSiteSettings(),
    getPublishedEmpreendimentos(),
  ]);

  const heroSlides = empreendimentos.flatMap((empreendimento) => {
    const galleryPaths = empreendimento.images
      .filter((image) => image.kind === "GALLERY")
      .map((image) => image.filePath);
    const preferredPaths = [empreendimento.coverImagePath, ...galleryPaths].filter(
      (value): value is string => Boolean(value),
    );
    const fallbackPath = empreendimento.images[0]?.filePath ?? null;
    const allPaths = preferredPaths.length > 0 ? preferredPaths : fallbackPath ? [fallbackPath] : [];

    const uniquePaths = Array.from(new Set(allPaths));
    const nonTechnicalPaths = uniquePaths.filter((path) => !isTechnicalHeroImage(path));
    const selectedPaths = nonTechnicalPaths.length > 0 ? nonTechnicalPaths : uniquePaths;

    return selectedPaths.map((imagePath, index) => ({
      id: `${empreendimento.id}-${index}`,
      empreendimentoName: empreendimento.name,
      empreendimentoSlug: empreendimento.slug,
      imagePath,
    }));
  }).slice(0, 12);

  return (
    <main>
      <HeroCarousel
        title={settings.homeTitle}
        subtitle={settings.homeSubtitle}
        slides={heroSlides}
        intervalSeconds={settings.homeCarouselIntervalSeconds}
      />

      <section className="section">
        <div className="container about-section">
          <p className="kicker">Institucional</p>
          <h2>{settings.aboutTitle}</h2>
          <p>{settings.aboutText}</p>
        </div>
      </section>

      <section className="section section-empreendimentos">
        <div className="container">
          <div className="section-head">
            <h2>Empreendimentos publicados</h2>
            <Link href="/empreendimentos">Ver todos</Link>
          </div>
          <div className="cards-grid">
            {empreendimentos.slice(0, 6).map((item) => {
              const galleryImage = item.images.find((image) => image.kind === "GALLERY")?.filePath;
              const image = item.coverImagePath ?? galleryImage ?? item.images[0]?.filePath;
              return (
                <article key={item.id} className="card">
                  {image ? (
                    <Image
                      src={publicPath(image)}
                      alt={item.name}
                      className="card-image"
                      width={800}
                      height={500}
                    />
                  ) : null}
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p>{item.shortDescription}</p>
                    <Link href={`/empreendimentos/${item.slug}`}>Ver empreendimento</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
