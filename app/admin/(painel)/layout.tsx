import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { canViewAdmin } from "@/lib/rbac";
import { getAuthSession } from "@/lib/session";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (!canViewAdmin(session.user.role)) {
    redirect("/");
  }

  return (
    <AdminShell
      userName={session.user.name ?? session.user.email ?? "Usuário"}
      roleLabel={session.user.roleLabel}
      role={session.user.role}
    >
      {children}
    </AdminShell>
  );
}
