"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPath, publicPath } from "@/lib/paths";

type ImageKind = "GALLERY" | "FLOOR_PLAN";

type GalleryImage = {
  id: string;
  filePath: string;
  title: string;
  caption: string | null;
  altText: string | null;
  kind: ImageKind;
  sortOrder: number;
};

type EmpreendimentoFormData = {
  id?: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  shortDescription: string;
  fullDescription: string;
  conceptText: string;
  commercialCalls: string[];
  technicalInfo: string[];
  institutionalTexts: string[];
  keyHighlights: string[];
  convenienceItems: string[];
  seoTitle: string;
  seoDescription: string;
  location: string;
  logoPath: string;
  logoDisplayDurationSeconds: number;
  coverImagePath: string;
  pdfPath: string;
  differentials: string[];
  images: GalleryImage[];
};

type EmpreendimentoFormProps = {
  mode: "create" | "edit";
  initialData?: EmpreendimentoFormData;
  canEdit: boolean;
};

type ListFieldKey =
  | "commercialCalls"
  | "technicalInfo"
  | "institutionalTexts"
  | "keyHighlights"
  | "convenienceItems"
  | "differentials";

const emptyData: EmpreendimentoFormData = {
  name: "",
  slug: "",
  status: "DRAFT",
  shortDescription: "",
  fullDescription: "",
  conceptText: "",
  commercialCalls: [""],
  technicalInfo: [""],
  institutionalTexts: [""],
  keyHighlights: [""],
  convenienceItems: [""],
  seoTitle: "",
  seoDescription: "",
  location: "",
  logoPath: "",
  logoDisplayDurationSeconds: 3,
  coverImagePath: "",
  pdfPath: "",
  differentials: [""],
  images: [],
};

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeList(values: string[]) {
  return values.map((item) => item.trim()).filter(Boolean);
}

function normalizeSecondsInput(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(60, Math.max(1, Math.trunc(parsed)));
}

export function EmpreendimentoForm({ mode, initialData, canEdit }: EmpreendimentoFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData ?? emptyData);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<null | "logo" | "capa" | "pdf" | "galeria" | "planta">(null);

  const empreendimentoId = formData.id;
  const canManageImages = canEdit && Boolean(empreendimentoId);
  const resolvedSlug = useMemo(
    () => formData.slug || toSlug(formData.name) || "empreendimento",
    [formData.slug, formData.name],
  );
  const galleryImages = useMemo(
    () => formData.images.filter((image) => image.kind === "GALLERY").sort((a, b) => a.sortOrder - b.sortOrder),
    [formData.images],
  );
  const floorPlanImages = useMemo(
    () => formData.images.filter((image) => image.kind === "FLOOR_PLAN").sort((a, b) => a.sortOrder - b.sortOrder),
    [formData.images],
  );

  function updateListValue(field: ListFieldKey, index: number, value: string) {
    setFormData((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  }

  function addListValue(field: ListFieldKey) {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  }

  function removeListValue(field: ListFieldKey, index: number) {
    setFormData((prev) => {
      const next = prev[field].filter((_, listIndex) => listIndex !== index);
      return { ...prev, [field]: next.length > 0 ? next : [""] };
    });
  }

  async function saveForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    setStatusMessage("");
    setIsSubmitting(true);

    const payload = {
      ...formData,
      slug: formData.slug || toSlug(formData.name),
      logoPath: formData.logoPath || null,
      coverImagePath: formData.coverImagePath || null,
      pdfPath: formData.pdfPath || null,
      conceptText: formData.conceptText || null,
      seoTitle: formData.seoTitle || null,
      seoDescription: formData.seoDescription || null,
      differentials: normalizeList(formData.differentials),
      commercialCalls: normalizeList(formData.commercialCalls),
      technicalInfo: normalizeList(formData.technicalInfo),
      institutionalTexts: normalizeList(formData.institutionalTexts),
      keyHighlights: normalizeList(formData.keyHighlights),
      convenienceItems: normalizeList(formData.convenienceItems),
    };

    const endpoint =
      mode === "create" ? "/api/admin/empreendimentos" : `/api/admin/empreendimentos/${formData.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(apiPath(endpoint), {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payloadError = await response.json().catch(() => null);
      setStatusMessage(payloadError?.error ?? "Nao foi possivel salvar o empreendimento.");
      return;
    }

    const saved = (await response.json()) as EmpreendimentoFormData;
    setFormData((prev) => ({ ...prev, id: saved.id, slug: saved.slug }));
    setStatusMessage(mode === "create" ? "Empreendimento criado." : "Empreendimento atualizado.");

    if (mode === "create") {
      router.push(`/admin/empreendimentos/${saved.id}`);
      router.refresh();
    } else {
      router.refresh();
    }
  }

  async function uploadFile(
    file: File,
    mediaType: "logo" | "capa" | "pdf" | "galeria" | "planta",
    onSuccess?: (filePath: string) => Promise<void>,
  ) {
    setStatusMessage("");
    setIsUploading(mediaType);

    const body = new FormData();
    body.append("file", file);
    body.append("mediaType", mediaType);
    body.append("empreendimentoSlug", resolvedSlug);

    const response = await fetch(apiPath("/api/admin/upload"), {
      method: "POST",
      body,
    });

    setIsUploading(null);

    if (!response.ok) {
      const payloadError = await response.json().catch(() => null);
      setStatusMessage(payloadError?.error ?? "Falha no upload.");
      return;
    }

    const payload = (await response.json()) as { filePath: string };

    if (onSuccess) {
      await onSuccess(payload.filePath);
      return;
    }

    setStatusMessage("Upload concluido.");
    router.refresh();
  }

  async function handleSingleUpload(
    event: ChangeEvent<HTMLInputElement>,
    mediaType: "logo" | "capa" | "pdf",
  ) {
    if (!canEdit) return;
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file, mediaType, async (filePath) => {
      setFormData((prev) => ({
        ...prev,
        logoPath: mediaType === "logo" ? filePath : prev.logoPath,
        coverImagePath: mediaType === "capa" ? filePath : prev.coverImagePath,
        pdfPath: mediaType === "pdf" ? filePath : prev.pdfPath,
      }));
    });
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    kind: ImageKind,
  ) {
    if (!canManageImages || !empreendimentoId) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const suggestedTitle = file.name.replace(/\.[^.]+$/, "");
    const mediaType = kind === "FLOOR_PLAN" ? "planta" : "galeria";

    await uploadFile(file, mediaType, async (filePath) => {
      const response = await fetch(apiPath(`/api/admin/empreendimentos/${empreendimentoId}/images`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath,
          title: suggestedTitle,
          caption: "",
          altText: suggestedTitle,
          kind,
        }),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        setStatusMessage(payloadError?.error ?? "Nao foi possivel cadastrar a imagem.");
        return;
      }

      const image = (await response.json()) as GalleryImage;
      setFormData((prev) => ({ ...prev, images: [...prev.images, image] }));
      setStatusMessage(kind === "FLOOR_PLAN" ? "Planta adicionada." : "Imagem adicionada na galeria.");
    });
  }

  async function saveImageMetadata(image: GalleryImage) {
    const response = await fetch(apiPath(`/api/admin/images/${image.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: image.title,
        caption: image.caption ?? "",
        altText: image.altText ?? image.title,
      }),
    });

    if (!response.ok) {
      setStatusMessage("Falha ao atualizar metadados da imagem.");
      return;
    }

    setStatusMessage("Metadados da imagem atualizados.");
  }

  async function deleteImage(imageId: string, kind: ImageKind) {
    if (!confirm(kind === "FLOOR_PLAN" ? "Excluir esta planta?" : "Excluir esta imagem da galeria?")) return;

    const response = await fetch(apiPath(`/api/admin/images/${imageId}`), { method: "DELETE" });

    if (!response.ok) {
      setStatusMessage("Falha ao excluir imagem.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== imageId),
    }));
    setStatusMessage(kind === "FLOOR_PLAN" ? "Planta removida." : "Imagem removida.");
  }

  async function reorderImages(kind: ImageKind, nextKindImages: GalleryImage[]) {
    if (!empreendimentoId) return;

    const normalizedNext = nextKindImages.map((image, index) => ({
      ...image,
      sortOrder: index,
      kind,
    }));

    setFormData((prev) => {
      const otherImages = prev.images.filter((image) => image.kind !== kind);
      return {
        ...prev,
        images: [...otherImages, ...normalizedNext],
      };
    });

    const response = await fetch(
      apiPath(`/api/admin/empreendimentos/${empreendimentoId}/images/reorder`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageIds: normalizedNext.map((image) => image.id),
          kind,
        }),
      },
    );

    if (!response.ok) {
      setStatusMessage("Falha ao reordenar imagens.");
      return;
    }

    setStatusMessage(kind === "FLOOR_PLAN" ? "Plantas reordenadas." : "Galeria reordenada.");
  }

  async function changeStatus(nextStatus: "DRAFT" | "PUBLISHED") {
    if (!canEdit || !empreendimentoId) return;

    const response = await fetch(apiPath(`/api/admin/empreendimentos/${empreendimentoId}/status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      setStatusMessage("Falha ao alterar status.");
      return;
    }

    setFormData((prev) => ({ ...prev, status: nextStatus }));
    setStatusMessage(nextStatus === "PUBLISHED" ? "Empreendimento publicado." : "Voltou para rascunho.");
    router.refresh();
  }

  async function deleteEmpreendimento() {
    if (!canEdit || !empreendimentoId) return;
    if (!confirm("Confirma a exclusao definitiva deste empreendimento?")) return;

    const response = await fetch(apiPath(`/api/admin/empreendimentos/${empreendimentoId}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Falha ao excluir empreendimento.");
      return;
    }

    router.push("/admin/empreendimentos");
    router.refresh();
  }

  function renderListField(title: string, field: ListFieldKey) {
    return (
      <section className="admin-form-subsection">
        <div className="admin-panel-head">
          <h3>{title}</h3>
          {canEdit ? (
            <button type="button" className="admin-link-btn" onClick={() => addListValue(field)}>
              Adicionar
            </button>
          ) : null}
        </div>
        <div className="admin-stack">
          {formData[field].map((item, index) => (
            <div key={`${field}-${index}`} className="admin-inline-row">
              <input
                value={item}
                disabled={!canEdit}
                onChange={(event) => updateListValue(field, index, event.target.value)}
              />
              {canEdit ? (
                <button
                  type="button"
                  className="admin-link-btn"
                  onClick={() => removeListValue(field, index)}
                >
                  Remover
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderImageSection(
    title: string,
    images: GalleryImage[],
    kind: ImageKind,
  ) {
    return (
      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>{title}</h2>
          <label className={`admin-link-btn ${!canManageImages ? "is-disabled" : ""}`}>
            {kind === "FLOOR_PLAN" ? "Adicionar planta" : "Adicionar imagem"}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={!canManageImages}
              onChange={(event) => handleImageUpload(event, kind)}
            />
          </label>
        </div>

        {!empreendimentoId ? (
          <p>Salve o empreendimento para habilitar este bloco.</p>
        ) : null}

        <div className="admin-gallery-grid">
          {images.map((image, index) => (
            <article key={image.id} className="admin-gallery-item">
              <Image
                src={publicPath(image.filePath)}
                alt={image.altText || image.title}
                width={400}
                height={260}
                className={kind === "FLOOR_PLAN" ? "admin-plan-preview" : undefined}
              />
              <div className="admin-gallery-fields">
                <input
                  value={image.title}
                  disabled={!canEdit}
                  placeholder="Titulo"
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.map((item) =>
                        item.id === image.id ? { ...item, title: event.target.value } : item,
                      ),
                    }))
                  }
                />
                <input
                  value={image.caption ?? ""}
                  disabled={!canEdit}
                  placeholder="Legenda"
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.map((item) =>
                        item.id === image.id ? { ...item, caption: event.target.value } : item,
                      ),
                    }))
                  }
                />
                <input
                  value={image.altText ?? ""}
                  disabled={!canEdit}
                  placeholder="Texto alternativo"
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.map((item) =>
                        item.id === image.id ? { ...item, altText: event.target.value } : item,
                      ),
                    }))
                  }
                />
              </div>

              <div className="admin-inline-row">
                <button
                  type="button"
                  className="admin-link-btn"
                  disabled={!canEdit}
                  onClick={() => saveImageMetadata(image)}
                >
                  Salvar texto
                </button>
                <button
                  type="button"
                  className="admin-link-btn"
                  disabled={!canEdit || index === 0}
                  onClick={() => {
                    const next = [...images];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    reorderImages(kind, next);
                  }}
                >
                  Subir
                </button>
                <button
                  type="button"
                  className="admin-link-btn"
                  disabled={!canEdit || index === images.length - 1}
                  onClick={() => {
                    const next = [...images];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    reorderImages(kind, next);
                  }}
                >
                  Descer
                </button>
                <button
                  type="button"
                  className="admin-link-btn danger"
                  disabled={!canEdit}
                  onClick={() => deleteImage(image.id, kind)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="admin-stack">
      <form className="admin-form" onSubmit={saveForm}>
        <div className="admin-form-head">
          <h1>{mode === "create" ? "Novo empreendimento" : "Editar empreendimento"}</h1>
          {canEdit ? (
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          ) : null}
        </div>

        <section className="admin-form-subsection">
          <h2>Identificacao</h2>
          <div className="admin-grid-2">
            <label>
              Nome do empreendimento
              <input
                value={formData.name}
                disabled={!canEdit}
                required
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: event.target.value,
                    slug: prev.slug || toSlug(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              Slug
              <input
                value={formData.slug}
                disabled={!canEdit}
                required
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, slug: toSlug(event.target.value) }))
                }
              />
            </label>
          </div>
        </section>

        <section className="admin-form-subsection">
          <h2>Status</h2>
          <div className="admin-grid-2">
            <label>
              Situacao
              <select
                value={formData.status}
                disabled={!canEdit}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: event.target.value as "DRAFT" | "PUBLISHED",
                  }))
                }
              >
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </label>
          </div>
        </section>

        <section className="admin-form-subsection">
          <h2>Apresentacao</h2>
          <label>
            Descricao curta
            <textarea
              value={formData.shortDescription}
              disabled={!canEdit}
              required
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, shortDescription: event.target.value }))
              }
            />
          </label>
          <label>
            Conceito / apresentacao
            <textarea
              value={formData.conceptText}
              disabled={!canEdit}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, conceptText: event.target.value }))
              }
            />
          </label>
          <label>
            Descricao completa
            <textarea
              value={formData.fullDescription}
              disabled={!canEdit}
              required
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, fullDescription: event.target.value }))
              }
            />
          </label>
        </section>

        <section className="admin-form-subsection">
          <h2>Localizacao</h2>
          <label>
            Localizacao principal
            <input
              value={formData.location}
              disabled={!canEdit}
              required
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, location: event.target.value }))
              }
            />
          </label>
        </section>

        {renderListField("Diferenciais", "differentials")}
        {renderListField("Chamadas comerciais", "commercialCalls")}
        {renderListField("Textos institucionais", "institutionalTexts")}
        {renderListField("Destaques principais", "keyHighlights")}
        {renderListField("Itens de conveniencia / estrutura", "convenienceItems")}
        {renderListField("Informacoes tecnicas disponiveis", "technicalInfo")}

        <section className="admin-form-subsection">
          <h2>Logo do empreendimento</h2>
          <div className="admin-grid-2">
            <label>
              Upload da logo
              <input
                type="file"
                accept=".svg,image/png,image/jpeg,image/webp"
                disabled={!canEdit}
                onChange={(event) => handleSingleUpload(event, "logo")}
              />
              <span className="admin-file-path">
                Use imagem em alta resolucao ou SVG para melhor qualidade na apresentacao inicial.
              </span>
              {formData.logoPath ? <span className="admin-file-path">{formData.logoPath}</span> : null}
            </label>
            <label>
              Tempo de exibição da logo (segundos)
              <input
                type="number"
                min={1}
                max={60}
                step={1}
                value={formData.logoDisplayDurationSeconds}
                disabled={!canEdit}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    logoDisplayDurationSeconds: normalizeSecondsInput(
                      event.target.value,
                      prev.logoDisplayDurationSeconds,
                    ),
                  }))
                }
              />
            </label>
            <div className="admin-inline-row">
              <button
                type="button"
                className="admin-link-btn"
                disabled={!canEdit || !formData.logoPath}
                onClick={() => setFormData((prev) => ({ ...prev, logoPath: "" }))}
              >
                Remover logo
              </button>
            </div>
          </div>
        </section>

        <section className="admin-form-subsection">
          <h2>Capa e PDF</h2>
          <div className="admin-grid-2">
            <label>
              Imagem de capa
              <input
                type="file"
                accept="image/*"
                disabled={!canEdit}
                onChange={(event) => handleSingleUpload(event, "capa")}
              />
              {formData.coverImagePath ? (
                <span className="admin-file-path">{formData.coverImagePath}</span>
              ) : null}
            </label>
            <label>
              PDF informativo
              <input
                type="file"
                accept="application/pdf"
                disabled={!canEdit}
                onChange={(event) => handleSingleUpload(event, "pdf")}
              />
              {formData.pdfPath ? <span className="admin-file-path">{formData.pdfPath}</span> : null}
            </label>
          </div>
          <div className="admin-inline-row">
            <button
              type="button"
              className="admin-link-btn"
              disabled={!canEdit || !formData.coverImagePath}
              onClick={() => setFormData((prev) => ({ ...prev, coverImagePath: "" }))}
            >
              Remover capa
            </button>
            <button
              type="button"
              className="admin-link-btn"
              disabled={!canEdit || !formData.pdfPath}
              onClick={() => setFormData((prev) => ({ ...prev, pdfPath: "" }))}
            >
              Remover PDF
            </button>
          </div>
        </section>

        <section className="admin-form-subsection">
          <h2>SEO / configuracoes tecnicas</h2>
          <div className="admin-grid-2">
            <label>
              SEO titulo
              <input
                value={formData.seoTitle}
                disabled={!canEdit}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, seoTitle: event.target.value }))
                }
              />
            </label>
            <label>
              SEO descricao
              <textarea
                value={formData.seoDescription}
                disabled={!canEdit}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, seoDescription: event.target.value }))
                }
              />
            </label>
          </div>
        </section>

        {mode === "edit" && empreendimentoId ? (
          <section className="admin-form-subsection">
            <div className="admin-panel-head">
              <h2>Publicacao</h2>
              <div className="admin-inline-row">
                <button
                  type="button"
                  className="admin-link-btn"
                  onClick={() => changeStatus("PUBLISHED")}
                  disabled={!canEdit || formData.status === "PUBLISHED"}
                >
                  Publicar
                </button>
                <button
                  type="button"
                  className="admin-link-btn"
                  onClick={() => changeStatus("DRAFT")}
                  disabled={!canEdit || formData.status === "DRAFT"}
                >
                  Voltar para rascunho
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {canEdit && mode === "edit" ? (
          <button type="button" className="btn btn-outline danger" onClick={deleteEmpreendimento}>
            Excluir empreendimento
          </button>
        ) : null}

        {isUploading ? <p className="form-status">Enviando arquivo...</p> : null}
        {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
        {!canEdit ? <p className="form-status">Seu perfil e somente leitura.</p> : null}
      </form>

      {renderImageSection("Galeria", galleryImages, "GALLERY")}
      {renderImageSection("Plantas dos Pavimentos", floorPlanImages, "FLOOR_PLAN")}

      <section className="admin-panel">
        <Link href="/admin/empreendimentos" className="admin-link-btn">
          Voltar para lista
        </Link>
      </section>
    </div>
  );
}
