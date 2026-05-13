"use client";

import { FormEvent, useState } from "react";
import { apiPath } from "@/lib/paths";

type ContactData = {
  id: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
};

type ContatosFormProps = {
  initialData: ContactData;
  canEdit: boolean;
};

export function ContatosForm({ initialData, canEdit }: ContatosFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    setStatus("");
    setIsSubmitting(true);

    const response = await fetch(apiPath("/api/admin/contacts"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setStatus("Não foi possível salvar os contatos.");
      return;
    }

    setStatus("Contatos atualizados.");
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-head">
        <h1>Contatos</h1>
        {canEdit ? (
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        ) : null}
      </div>

      <label>
        Telefone
        <input
          value={formData.phone}
          disabled={!canEdit}
          onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
        />
      </label>

      <label>
        WhatsApp (link)
        <input
          value={formData.whatsapp}
          disabled={!canEdit}
          onChange={(event) => setFormData((prev) => ({ ...prev, whatsapp: event.target.value }))}
        />
      </label>

      <label>
        Instagram (link)
        <input
          value={formData.instagram}
          disabled={!canEdit}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, instagram: event.target.value }))
          }
        />
      </label>

      <label>
        E-mail
        <input
          type="email"
          value={formData.email}
          disabled={!canEdit}
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
        />
      </label>

      {status ? <p className="form-status">{status}</p> : null}
      {!canEdit ? <p className="form-status">Seu perfil é somente leitura.</p> : null}
    </form>
  );
}
