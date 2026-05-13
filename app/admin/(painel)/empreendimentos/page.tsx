import { EmpreendimentosTable } from "@/components/admin/EmpreendimentosTable";
import { canEditContent } from "@/lib/rbac";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminEmpreendimentosPage() {
  const [session, empreendimentos] = await Promise.all([
    getAuthSession(),
    prisma.empreendimento.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        location: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const canEdit = session?.user ? canEditContent(session.user.role) : false;

  return <EmpreendimentosTable initialItems={empreendimentos} canEdit={canEdit} />;
}
