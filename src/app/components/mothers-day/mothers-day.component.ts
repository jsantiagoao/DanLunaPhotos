import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoaderComponent } from '../loader/loader.component';
import { FooterComponent } from '../footer/footer.component';
import { MothersDayContentComponent } from '../mothers-day-content/mothers-day-content.component';
import { BreadcrumbItem } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-mothers-day',
  standalone: true,
  imports: [
    NavbarComponent,
    LoaderComponent,
    FooterComponent,
    MothersDayContentComponent
  ],
  template: `
    <app-loader />
    <app-navbar />
    <main class="mothers-day-page">
      <app-mothers-day-content [breadcrumbs]="breadcrumbs" />
    </main>
    <app-footer />
  `,
  styles: [`
    main { display: block; }
  `]
})
export class MothersDayComponent implements OnInit, OnDestroy {
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Día de las Madres' }
  ];

  private jsonLdScript: HTMLScriptElement | null = null;
  private previousTitle = '';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.previousTitle = this.titleService.getTitle();

    // ── Title ────────────────────────────────────────────────────────────
    this.titleService.setTitle(
      'Mini Sesiones Día de las Madres 2026 · Fotografía en Querétaro | Dan Luna Photo'
    );

    // ── Primary meta ────────────────────────────────────────────────────
    this.metaService.updateTag({
      name: 'description',
      content:
        'Mini sesiones fotográficas del Día de las Madres 2026 en Querétaro. ' +
        '40 min de sesión · 25–30 fotos editadas · hasta 5 personas. ' +
        'Precio de preventa $1,800. Aparta con el 50%. ¡Lugares limitados!'
    });
    this.metaService.updateTag({
      name: 'keywords',
      content:
        'mini sesiones día de las madres querétaro, fotografía día de las madres 2026, ' +
        'sesión fotográfica querétaro, fotógrafo querétaro, fotografía familiar querétaro, ' +
        'regalo día de las madres, fotos mamá querétaro, Dan Luna Photo'
    });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({
      name: 'author',
      content: 'Dan Luna Photo'
    });

    // ── Canonical ────────────────────────────────────────────────────────
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://danlunaphoto.duodigitalservice.com/dia-de-las-madres');

    // ── Open Graph — Facebook, WhatsApp, LinkedIn, Telegram ─────────────
    const ogImage = 'https://danlunaphoto.duodigitalservice.com/assets/images/slider/Sesion-dia-de-las-madres-queretaro.jpeg';
    const ogTitle = '🌸 Mini Sesiones Día de las Madres 2026 · Dan Luna Photo · Querétaro';
    const ogDesc  =
      'Regala un recuerdo que dura para siempre. Sesión fotográfica en estudio · ' +
      '40 min · 25–30 fotos editadas · hasta 5 personas. ' +
      'Preventa $1,800 MXN. ¡Aparta con el 50% y lugares limitados!';

    this.metaService.updateTag({ property: 'og:type',             content: 'website' });
    this.metaService.updateTag({ property: 'og:locale',           content: 'es_MX' });
    this.metaService.updateTag({ property: 'og:locale:alternate', content: 'es_ES' });
    this.metaService.updateTag({ property: 'og:site_name',        content: 'Dan Luna Photo' });
    this.metaService.updateTag({ property: 'og:url',              content: 'https://danlunaphoto.duodigitalservice.com/dia-de-las-madres' });
    this.metaService.updateTag({ property: 'og:title',            content: ogTitle });
    this.metaService.updateTag({ property: 'og:description',      content: ogDesc });
    this.metaService.updateTag({ property: 'og:image',            content: ogImage });
    this.metaService.updateTag({ property: 'og:image:secure_url', content: ogImage });
    this.metaService.updateTag({ property: 'og:image:type',       content: 'image/jpeg' });
    this.metaService.updateTag({ property: 'og:image:width',      content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height',     content: '630' });
    this.metaService.updateTag({ property: 'og:image:alt',        content: 'Mini Sesiones Día de las Madres 2026 — Dan Luna Photo Querétaro' });

    // ── Twitter / X Card ─────────────────────────────────────────────────
    this.metaService.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:site',        content: '@danlunaphotos' });
    this.metaService.updateTag({ name: 'twitter:creator',     content: '@danlunaphotos' });
    this.metaService.updateTag({ name: 'twitter:title',       content: ogTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: ogDesc });
    this.metaService.updateTag({ name: 'twitter:image',       content: ogImage });
    this.metaService.updateTag({ name: 'twitter:image:alt',   content: 'Mini Sesiones Día de las Madres 2026 — Dan Luna Photo Querétaro' });

    // ── JSON-LD Structured Data ──────────────────────────────────────────
    this.jsonLdScript = this.document.createElement('script');
    this.jsonLdScript.type = 'application/ld+json';
    this.jsonLdScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LocalBusiness',
          '@id': 'https://danlunaphoto.duodigitalservice.com/#business',
          name: 'Dan Luna Photo',
          description: 'Estudio de fotografía profesional en Querétaro especializado en retratos, familias y sesiones especiales.',
          url: 'https://danlunaphoto.duodigitalservice.com',
          telephone: '+525667704976',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Querétaro',
            addressRegion: 'Querétaro',
            addressCountry: 'MX'
          },
          sameAs: [
            'https://www.instagram.com/danlunaphotos',
            'https://danlunaphotos.pixieset.com'
          ]
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio',              item: 'https://danlunaphoto.duodigitalservice.com' },
            { '@type': 'ListItem', position: 2, name: 'Día de las Madres',   item: 'https://danlunaphoto.duodigitalservice.com/dia-de-las-madres' }
          ]
        },
        {
          '@type': 'Service',
          '@id': 'https://danlunaphoto.duodigitalservice.com/dia-de-las-madres#service',
          name: 'Mini Sesión Fotográfica Día de las Madres 2026',
          description:
            'Mini sesión fotográfica en estudio para el Día de las Madres 2026 en Querétaro. ' +
            '40 minutos de sesión, 25 a 30 fotografías digitales editadas en alta calidad, ' +
            'hasta 5 personas, opción a dos cambios de ropa.',
          provider: { '@id': 'https://danlunaphoto.duodigitalservice.com/#business' },
          areaServed: { '@type': 'City', name: 'Querétaro' },
          offers: [
            {
              '@type': 'Offer',
              name: 'Precio de preventa',
              price: '1800',
              priceCurrency: 'MXN',
              availability: 'https://schema.org/LimitedAvailability',
              validThrough: '2026-05-10',
              url: 'https://danlunaphotos.pixieset.com/booking/mother-s-day-danlunaphotos'
            },
            {
              '@type': 'Offer',
              name: 'Precio regular',
              price: '2300',
              priceCurrency: 'MXN',
              availability: 'https://schema.org/InStock',
              url: 'https://danlunaphotos.pixieset.com/booking/mother-s-day-danlunaphotos'
            }
          ],
          image: 'https://danlunaphoto.duodigitalservice.com/assets/images/slider/Sesion-dia-de-las-madres-queretaro.jpeg'
        }
      ]
    });
    this.document.head.appendChild(this.jsonLdScript);
  }

  ngOnDestroy(): void {
    this.titleService.setTitle(this.previousTitle);
    if (this.jsonLdScript) {
      this.document.head.removeChild(this.jsonLdScript);
    }
  }
}

