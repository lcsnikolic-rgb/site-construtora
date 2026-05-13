import { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSiteContact } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const contact = await getSiteContact();

  return (
    <div className="site-shell">
      <SiteHeader />
      {children}
      <SiteFooter
        phone={contact.phone}
        email={contact.email}
        whatsapp={contact.whatsapp}
        instagram={contact.instagram}
      />
    </div>
  );
}
