"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPath } from "@/lib/paths";

type EmpreendimentoItem = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  location: string;
  updatedAt: string | Date;
};

type EmpreendimentosTableProps = {
  initialItems: EmpreendimentoItem[];
  canEdit: boolean;
};

export function EmpreendimentosTable({ initialItems, canEdit }: EmpreendimentosTableProps) {
  const [items, setItems] = useState(initialItems);
  const [statusMessage, setStatusMessage] = useState("");

  async function changeStatus(item: EmpreendimentoItem, status: "DRAFT" | "PUBLISHED") {
    const response = await fetch(apiPath(`/api/admin/empreendimentos/${item.id}/status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setStatusMessage("Falha ao alterar status.");
      return;
    }

    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, status } : row)),
    );
    setStatusMessage(status === "PUBLISHED" ? "Empreendimento publicado." : "Voltou para rascunho.");
  }

  async function removeItem(item: EmpreendimentoItem) {
    if (!confirm(`Excluir "${item.name}"?`)) return;

    const response = await fetch(apiPath(`/api/admin/empreendimentos/${item.id}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Falha ao excluir empreendimento.");
      return;
    }

    setItems((prev) => prev.filter((row) => row.id !== item.id));
    setStatusMessage("Empreendimento excluído.");
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h1>Empreendimentos</h1>
        {canEdit ? (
          <Link href="/admin/empreendimentos/novo" className="admin-link-btn">
            Novo empreendimento
          </Link>
        ) : null}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Localização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.slug}</td>
                <td>{item.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</td>
                <td>{item.location}</td>
                <td>
                  <div className="admin-inline-row">
                    <Link href={`/admin/empreendimentos/${item.id}`}>Editar</Link>
                    {canEdit ? (
                      <>
                        {item.status === "DRAFT" ? (
                          <button type="button" onClick={() => changeStatus(item, "PUBLISHED")}>
                            Publicar
                          </button>
                        ) : (
                          <button type="button" onClick={() => changeStatus(item, "DRAFT")}>
                            Rascunho
                          </button>
                        )}
                        <button type="button" className="danger" onClick={() => removeItem(item)}>
                          Excluir
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
      {!canEdit ? <p className="form-status">Seu perfil é somente leitura.</p> : null}
    </section>
  );
}
