import { ContatosForm } from "@/components/admin/ContatosForm";
import { getSiteContact } from "@/lib/data";
import { canEditContent } from "@/lib/rbac";
import { getAuthSession } from "@/lib/session";

export default async function AdminContatosPage() {
  const [contact, session] = await Promise.all([getSiteContact(), getAuthSession()]);
  const canEdit = session?.user ? canEditContent(session.user.role) : false;

  return <ContatosForm initialData={contact} canEdit={canEdit} />;
}
