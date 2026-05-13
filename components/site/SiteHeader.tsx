"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { publicPath } from "@/lib/paths";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/empreendimentos", label: "Empreendimentos" },
  { href: "/contato", label: "Fale conosco" },
];

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand-logo-link" href="/" aria-label="Construtora Forma Espaco">
          <Image
            src={publicPath("/brand/logo-forma-espaco-dark.png")}
            alt="Construtora Forma Espaco"
            width={220}
            height={135}
            className="brand-logo-image"
            priority
          />
        </Link>

        <nav className="site-nav" aria-label="Navegacao principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="mobile-nav-panel"
        className={`mobile-nav-panel ${isMobileMenuOpen ? "is-open" : ""}`}
      >
        <nav className="mobile-nav-links" aria-label="Navegacao mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
