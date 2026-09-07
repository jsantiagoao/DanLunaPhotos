import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

/**
 * Configuracion SEO de una pagina. Todo lo que varia entre paginas en un solo
 * objeto declarativo, en vez de ~30 llamadas imperativas a updateTag repetidas.
 */
export interface SeoConfig {
  title: string;
  description: string;
  url: string;
  keywords?: string;
  image?: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Objeto schema.org; se serializa a un <script type="application/ld+json">. */
  jsonLd?: unknown;
}

/**
 * Facade sobre Title + Meta + canonical + JSON-LD.
 *
 * Centraliza (DRY) el SEO que cada pagina repetia inline. Las paginas ahora
 * llaman a `seo.apply({...})` con su configuracion y `seo.clearJsonLd()` en
 * ngOnDestroy. Unica responsabilidad: gestionar metadatos del documento.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private jsonLdScript: HTMLScriptElement | null = null;

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  apply(cfg: SeoConfig): void {
    this.title.setTitle(cfg.title);
    this.meta.updateTag({ name: 'description', content: cfg.description });
    if (cfg.keywords) this.meta.updateTag({ name: 'keywords', content: cfg.keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.setCanonical(cfg.url);

    const ogTitle = cfg.ogTitle ?? cfg.title;
    const ogDesc = cfg.ogDescription ?? cfg.description;
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_MX' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Dan Luna Photo' });
    this.meta.updateTag({ property: 'og:url', content: cfg.url });
    this.meta.updateTag({ property: 'og:title', content: ogTitle });
    this.meta.updateTag({ property: 'og:description', content: ogDesc });
    if (cfg.image) {
      // Actualiza TODOS los tags de imagen (no solo og:image), para que el
      // secure_url/alt heredados del index.html base no apunten al generico.
      this.meta.updateTag({ property: 'og:image', content: cfg.image });
      this.meta.updateTag({ property: 'og:image:secure_url', content: cfg.image });
      this.meta.updateTag({ property: 'og:image:alt', content: ogTitle });
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: ogTitle });
    this.meta.updateTag({ name: 'twitter:description', content: ogDesc });
    if (cfg.image) this.meta.updateTag({ name: 'twitter:image', content: cfg.image });

    if (cfg.jsonLd) this.setJsonLd(cfg.jsonLd);
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data: unknown): void {
    this.clearJsonLd();
    this.jsonLdScript = this.document.createElement('script');
    this.jsonLdScript.type = 'application/ld+json';
    this.jsonLdScript.text = JSON.stringify(data);
    this.document.head.appendChild(this.jsonLdScript);
  }

  /** Retira el JSON-LD inyectado. Llamar en ngOnDestroy de la pagina. */
  clearJsonLd(): void {
    if (this.jsonLdScript && this.jsonLdScript.parentNode) {
      this.jsonLdScript.parentNode.removeChild(this.jsonLdScript);
    }
    this.jsonLdScript = null;
  }
}
