import { redirect } from "next/navigation";
import { UsuariosManager } from "@/components/admin/UsuariosManager";
import { canManageUsers } from "@/lib/rbac";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminUsuariosPage() {
  const session = await getAuthSession();

  if (!session?.user || !canManageUsers(session.user.role)) {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: {
        select: {
          id: true,
          name: true,
          label: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return <UsuariosManager initialUsers={users} />;
}
