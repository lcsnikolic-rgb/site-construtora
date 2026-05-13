import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [stats, latestEmpreendimentos] = await Promise.all([
    getAdminDashboardStats(),
    prisma.empreendimento.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="admin-stack">
      <section className="admin-cards">
        <article className="admin-card">
          <p>Total de empreendimentos</p>
          <strong>{stats.total}</strong>
        </article>
        <article className="admin-card">
          <p>Publicados</p>
          <strong>{stats.published}</strong>
        </article>
        <article className="admin-card">
          <p>Rascunhos</p>
          <strong>{stats.drafts}</strong>
        </article>
        <article className="admin-card">
          <p>Usuários</p>
          <strong>{stats.users}</strong>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h1>Atualizações recentes</h1>
          <Link href="/admin/empreendimentos" className="admin-link-btn">
            Gerenciar empreendimentos
          </Link>
        </div>
        <ul className="admin-list">
          {latestEmpreendimentos.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</p>
              </div>
              <Link href={`/admin/empreendimentos/${item.id}`}>Editar</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
