import Link from "next/link";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/ContactIcons";

type SiteFooterProps = {
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
};

export function SiteFooter({ phone, email, whatsapp, instagram }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div>
          <p className="footer-title">Construtora Forma Espaco</p>
          <p className="footer-muted">
            Projetos com identidade arquitetonica e atencao tecnica do conceito a entrega.
          </p>
        </div>

        <div className="footer-contact-block">
          <p className="footer-title">Contato</p>
          <div className="footer-contact-columns">
            <div className="footer-contact-info">
              <span>Telefone</span>
              <strong>{phone}</strong>
              <span>E-mail</span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
            <div className="footer-social-links">
              <a
                className="footer-social-btn"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="Iniciar conversa no WhatsApp em nova aba"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
              <a
                className="footer-social-btn"
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Ver Instagram em nova aba"
              >
                <InstagramIcon />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div>
          <p className="footer-title">Acesso</p>
          <p>
            <Link href="/admin/login">Area administrativa</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
