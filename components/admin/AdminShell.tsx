import { ReactNode } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SignOutButton } from "@/components/admin/SignOutButton";

type AdminShellProps = {
  children: ReactNode;
  userName: string;
  roleLabel: string;
  role: "ADMIN" | "EDITOR" | "VISUALIZADOR";
};

export function AdminShell({ children, userName, roleLabel, role }: AdminShellProps) {
  return (
    <div className="admin-layout">
      <AdminSidebar userName={userName} roleLabel={roleLabel} role={role} />

      <div className="admin-main">
        <header className="admin-topbar">
          <Link href="/" className="admin-view-site">
            Ver site
          </Link>
          <SignOutButton />
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
