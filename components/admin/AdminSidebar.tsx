"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleName } from "@prisma/client";
import { routePath } from "@/lib/paths";

type AdminSidebarProps = {
  userName: string;
  roleLabel: string;
  role: RoleName;
};

const menu: Array<{ href: string; label: string; roles: RoleName[] }> = [
  { href: "/admin", label: "Dashboard", roles: ["ADMIN", "EDITOR", "VISUALIZADOR"] },
  {
    href: "/admin/pagina-inicial",
    label: "Página inicial",
    roles: ["ADMIN", "EDITOR", "VISUALIZADOR"],
  },
  {
    href: "/admin/empreendimentos",
    label: "Empreendimentos",
    roles: ["ADMIN", "EDITOR", "VISUALIZADOR"],
  },
  { href: "/admin/contatos", label: "Contatos", roles: ["ADMIN", "EDITOR", "VISUALIZADOR"] },
  { href: "/admin/usuarios", label: "Usuários", roles: ["ADMIN"] },
];

export function AdminSidebar({ userName, roleLabel, role }: AdminSidebarProps) {
  const pathname = routePath(usePathname());

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-head">
        <p className="admin-brand">Forma Espaço</p>
        <p className="admin-user">{userName}</p>
        <p className="admin-role">{roleLabel}</p>
      </div>

      <nav className="admin-menu" aria-label="Menu administrativo">
        {menu
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

            return (
              <Link key={item.href} href={item.href} className={isActive ? "is-active" : ""}>
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
