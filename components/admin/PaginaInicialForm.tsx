"use client";

import { FormEvent, useState } from "react";
import { apiPath } from "@/lib/paths";

type SettingsData = {
  id: string;
  homeTitle: string;
  homeSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  homeCarouselIntervalSeconds: number;
};

type PaginaInicialFormProps = {
  initialData: SettingsData;
  canEdit: boolean;
};

export function PaginaInicialForm({ initialData, canEdit }: PaginaInicialFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function normalizeSecondsInput(value: string, fallback: number) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(60, Math.max(1, Math.trunc(parsed)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    setStatus("");
    setIsSubmitting(true);

    const response = await fetch(apiPath("/api/admin/settings"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setStatus("Não foi possível salvar as alterações.");
      return;
    }

    setStatus("Conteúdo da página inicial atualizado.");
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-head">
        <h1>Página inicial</h1>
        {canEdit ? (
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </button>
        ) : null}
      </div>

      <label>
        Título
        <input
          value={formData.homeTitle}
          disabled={!canEdit}
          onChange={(event) => setFormData((prev) => ({ ...prev, homeTitle: event.target.value }))}
        />
      </label>

      <label>
        Subtítulo
        <textarea
          value={formData.homeSubtitle}
          disabled={!canEdit}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, homeSubtitle: event.target.value }))
          }
        />
      </label>

      <label>
        Título da seção Sobre nós
        <input
          value={formData.aboutTitle}
          disabled={!canEdit}
          onChange={(event) => setFormData((prev) => ({ ...prev, aboutTitle: event.target.value }))}
        />
      </label>

      <label>
        Texto da seção Sobre nós
        <textarea
          value={formData.aboutText}
          disabled={!canEdit}
          onChange={(event) => setFormData((prev) => ({ ...prev, aboutText: event.target.value }))}
        />
      </label>

      <label>
        Tempo de troca das imagens da home (segundos)
        <input
          type="number"
          min={1}
          max={60}
          step={1}
          value={formData.homeCarouselIntervalSeconds}
          disabled={!canEdit}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              homeCarouselIntervalSeconds: normalizeSecondsInput(
                event.target.value,
                prev.homeCarouselIntervalSeconds,
              ),
            }))
          }
        />
      </label>

      <div className="admin-grid-2">
        <label>
          Botão principal - texto
          <input
            value={formData.primaryButtonLabel}
            disabled={!canEdit}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, primaryButtonLabel: event.target.value }))
            }
          />
        </label>

        <label>
          Botão principal - rota
          <input
            value={formData.primaryButtonHref}
            disabled={!canEdit}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, primaryButtonHref: event.target.value }))
            }
          />
        </label>

        <label>
          Botão secundário - texto
          <input
            value={formData.secondaryButtonLabel}
            disabled={!canEdit}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, secondaryButtonLabel: event.target.value }))
            }
          />
        </label>

        <label>
          Botão secundário - rota
          <input
            value={formData.secondaryButtonHref}
            disabled={!canEdit}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, secondaryButtonHref: event.target.value }))
            }
          />
        </label>
      </div>

      {status ? <p className="form-status">{status}</p> : null}
      {!canEdit ? <p className="form-status">Seu perfil é somente leitura.</p> : null}
    </form>
  );
}
