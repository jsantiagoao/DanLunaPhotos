import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-fotografa-en-queretaro',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, BreadcrumbComponent],
  templateUrl: './fotografa-en-queretaro.component.html',
  styleUrl: './fotografa-en-queretaro.component.scss'
})
export class FotografaEnQueretaroComponent implements OnInit, OnDestroy {

  private jsonLdScript: HTMLScriptElement | null = null;

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Fotógrafa en Querétaro' }
  ];

  constructor(
    private titleSvc: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnDestroy(): void {
    if (this.jsonLdScript?.parentNode) {
      this.jsonLdScript.parentNode.removeChild(this.jsonLdScript);
    }
  }

  ngOnInit(): void {
    this.titleSvc.setTitle('Daniela Luna · Fotógrafa Profesional en Querétaro | Dan Luna Photo');

    this.meta.updateTag({ name: 'description', content: 'Soy Daniela Luna, fotógrafa profesional en Querétaro con base en arquitectura y narrativa visual. Retratos, familias y sesiones especiales con intención y alma.' });
    this.meta.updateTag({ name: 'keywords',    content: 'fotógrafa profesional querétaro, Daniela Luna fotógrafa, fotografía de retrato querétaro, fotografía familiar querétaro, fotógrafa arquitectura querétaro, Dan Luna Photo' });
    this.meta.updateTag({ name: 'robots',      content: 'index, follow' });

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://danlunaphoto.com/fotografa-en-queretaro';

    // Open Graph
    this.meta.updateTag({ property: 'og:title',       content: 'Daniela Luna · Fotógrafa en Querétaro | Dan Luna Photo' });
    this.meta.updateTag({ property: 'og:description', content: 'Fotografía con arquitectura y alma. Daniela Luna — fotógrafa profesional en Querétaro.' });
    this.meta.updateTag({ property: 'og:url',         content: 'https://danlunaphoto.com/fotografa-en-queretaro' });
    this.meta.updateTag({ property: 'og:image',       content: 'https://danlunaphoto.com/assets/images/Daniela_Luna_Fotografa-1024x776.jpg' });
    this.meta.updateTag({ property: 'og:type',        content: 'profile' });

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: 'Daniela Luna · Fotógrafa en Querétaro | Dan Luna Photo' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Fotografía con arquitectura y alma. Daniela Luna — fotógrafa profesional en Querétaro.' });
    this.meta.updateTag({ name: 'twitter:image',       content: 'https://danlunaphoto.com/assets/images/Daniela_Luna_Fotografa-1024x776.jpg' });

    if (isPlatformBrowser(this.platformId)) {
      this.injectJsonLd();
    }
  }

  private injectJsonLd(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': 'https://danlunaphoto.com/fotografa-en-queretaro#daniela',
          name: 'Daniela Luna',
          jobTitle: 'Fotógrafa Profesional',
          description: 'Fotógrafa profesional en Querétaro con formación en arquitectura. Especializada en retratos, familias y mini sesiones con narrativa visual.',
          url: 'https://danlunaphoto.com/fotografa-en-queretaro',
          image: 'https://danlunaphoto.com/assets/images/Daniela_Luna_Fotografa-1024x776.jpg',
          worksFor: { '@id': 'https://danlunaphoto.com/#business' },
          sameAs: [
            'https://www.instagram.com/danlunaphotos',
            'https://www.facebook.com/people/Dan-Luna-Photo/61574229764276'
          ],
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Querétaro',
            addressRegion: 'Querétaro',
            addressCountry: 'MX'
          }
        },
        {
          '@type': 'LocalBusiness',
          '@id': 'https://danlunaphoto.com/#business',
          name: 'Dan Luna Photo',
          url: 'https://danlunaphoto.com',
          telephone: '+52-56-6770-4976',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Querétaro',
            addressRegion: 'Querétaro',
            addressCountry: 'MX'
          }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio',                  item: 'https://danlunaphoto.com' },
            { '@type': 'ListItem', position: 2, name: 'Fotógrafa en Querétaro',  item: 'https://danlunaphoto.com/fotografa-en-queretaro' }
          ]
        }
      ]
    };

    this.jsonLdScript = document.createElement('script');
    this.jsonLdScript.type = 'application/ld+json';
    this.jsonLdScript.id   = 'fotografa-jsonld';
    this.jsonLdScript.text  = JSON.stringify(schema);
    document.head.appendChild(this.jsonLdScript);
  }
}
