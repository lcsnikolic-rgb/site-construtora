import { getSiteContact } from "@/lib/data";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/ContactIcons";

export default async function ContatoPage() {
  const contact = await getSiteContact();

  return (
    <main className="section">
      <div className="container contato-grid">
        <div>
          <p className="kicker">Fale conosco</p>
          <h1>Contato</h1>
          <p className="home-subtitle">
            Nossa equipe esta disponivel para apresentar empreendimentos, esclarecer duvidas e
            apoiar o processo de decisao.
          </p>
        </div>

        <div className="contato-card">
          <div className="contato-info">
            <span>Telefone</span>
            <strong>{contact.phone}</strong>
          </div>

          <div className="contato-actions" aria-label="Canais de atendimento">
            <a
              className="contato-action-btn whatsapp"
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="Iniciar conversa no WhatsApp em nova aba"
            >
              <WhatsAppIcon />
              <span>Iniciar conversa no WhatsApp</span>
            </a>
            <a
              className="contato-action-btn instagram"
              href={contact.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Ver Instagram em nova aba"
            >
              <InstagramIcon />
              <span>Ver Instagram</span>
            </a>
          </div>

          <div className="contato-info">
            <span>E-mail</span>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
        </div>
      </div>
    </main>
  );
}
