"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiPath } from "@/lib/paths";

type UserItem = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: {
    id: string;
    name: "ADMIN" | "EDITOR" | "VISUALIZADOR";
    label: string;
  };
};

type UsuariosManagerProps = {
  initialUsers: UserItem[];
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "EDITOR" as "ADMIN" | "EDITOR" | "VISUALIZADOR",
  isActive: true,
};

export function UsuariosManager({ initialUsers }: UsuariosManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedId) ?? null,
    [users, selectedId],
  );

  function handleSelect(user: UserItem) {
    setSelectedId(user.id);
    setStatus("");
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role.name,
      isActive: user.isActive,
    });
  }

  function handleNewUser() {
    setSelectedId(null);
    setStatus("");
    setFormData(emptyForm);
  }

  async function refreshUsers() {
    const response = await fetch(apiPath("/api/admin/users"));
    if (!response.ok) return;
    const data = (await response.json()) as UserItem[];
    setUsers(data);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    const isEditing = Boolean(selectedId);
    const endpoint = isEditing ? `/api/admin/users/${selectedId}` : "/api/admin/users";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(apiPath(endpoint), {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus(payload?.error ?? "Não foi possível salvar o usuário.");
      return;
    }

    await refreshUsers();
    if (!isEditing) {
      handleNewUser();
    }
    setStatus(isEditing ? "Usuário atualizado." : "Usuário criado.");
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    const response = await fetch(apiPath(`/api/admin/users/${selectedId}`), { method: "DELETE" });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus(payload?.error ?? "Não foi possível excluir o usuário.");
      return;
    }

    await refreshUsers();
    handleNewUser();
    setStatus("Usuário excluído.");
  }

  return (
    <div className="admin-two-columns">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <h1>Usuários</h1>
          <button type="button" className="admin-link-btn" onClick={handleNewUser}>
            Novo usuário
          </button>
        </div>
        <ul className="admin-list">
          {users.map((user) => (
            <li key={user.id}>
              <button type="button" className="admin-user-item" onClick={() => handleSelect(user)}>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
                <span>
                  {user.role.label} {user.isActive ? "" : "(Inativo)"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-head">
          <h2>{selectedUser ? "Editar usuário" : "Novo usuário"}</h2>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <label>
          Nome
          <input
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={formData.email}
            onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>

        <label>
          Senha {selectedUser ? "(deixe em branco para manter)" : ""}
          <input
            type="password"
            value={formData.password}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, password: event.target.value }))
            }
            required={!selectedUser}
          />
        </label>

        <label>
          Cargo
          <select
            value={formData.role}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                role: event.target.value as "ADMIN" | "EDITOR" | "VISUALIZADOR",
              }))
            }
          >
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Editor</option>
            <option value="VISUALIZADOR">Visualizador</option>
          </select>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, isActive: event.target.checked }))
            }
          />
          Usuário ativo
        </label>

        {selectedUser ? (
          <button type="button" className="btn btn-outline danger" onClick={handleDelete}>
            Excluir usuário
          </button>
        ) : null}

        {status ? <p className="form-status">{status}</p> : null}
      </form>
    </div>
  );
}
