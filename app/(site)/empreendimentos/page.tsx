import Image from "next/image";
import Link from "next/link";
import { getPublishedEmpreendimentos } from "@/lib/data";
import { publicPath } from "@/lib/paths";

export default async function EmpreendimentosPage() {
  const empreendimentos = await getPublishedEmpreendimentos();

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <h1>Empreendimentos</h1>
          <p>{empreendimentos.length} empreendimento(s) publicado(s).</p>
        </div>

        <div className="cards-grid">
          {empreendimentos.map((item) => {
            const galleryImage = item.images.find((image) => image.kind === "GALLERY")?.filePath;
            const image = item.coverImagePath ?? galleryImage ?? item.images[0]?.filePath;

            return (
              <article key={item.id} className="card">
                {image ? (
                  <Image
                    src={publicPath(image)}
                    alt={item.name}
                    className="card-image"
                    width={900}
                    height={560}
                  />
                ) : null}
                <div className="card-content">
                  <p className="card-location">{item.location}</p>
                  <h2>{item.name}</h2>
                  <p>{item.shortDescription}</p>
                  <Link href={`/empreendimentos/${item.slug}`}>Detalhes</Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
