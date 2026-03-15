import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { AboutComponent } from '../../components/about/about.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    LoaderComponent,
    HeroComponent,
    GalleryComponent,
    AboutComponent,
    TestimonialsComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <app-loader />
    <app-navbar />
    <main>
      <app-hero id="inicio" />
      <app-gallery id="portfolio" />
      <app-about id="sobre-mi" />
      <app-testimonials id="testimonios" />
      <app-contact id="contacto" />
    </main>
    <app-footer />
  `,
  styles: [`main { display: block; }`]
})
export class HomeComponent implements OnInit {

  constructor(
    private titleSvc: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.titleSvc.setTitle('Dan Luna Photo · Fotografía Profesional en Querétaro');

    this.meta.updateTag({ name: 'description', content: 'Dan Luna Photo — Estudio de fotografía profesional en Querétaro. Sesiones de retrato, familias, eventos y mini sesiones especiales. Capturamos los momentos que importan.' });
    this.meta.updateTag({ name: 'keywords',    content: 'fotografía profesional querétaro, fotógrafa querétaro, sesiones de retrato querétaro, fotografía familiar querétaro, mini sesiones querétaro, Dan Luna Photo' });
    this.meta.updateTag({ name: 'robots',      content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title',       content: 'Dan Luna Photo · Fotografía Profesional en Querétaro' });
    this.meta.updateTag({ property: 'og:description', content: 'Estudio de fotografía profesional en Querétaro. Retratos, familias y mini sesiones especiales. Capturamos los momentos que importan.' });
    this.meta.updateTag({ property: 'og:url',         content: 'https://danlunaphotos.com' });
    this.meta.updateTag({ property: 'og:image',       content: 'https://danlunaphotos.com/assets/images/og-default.jpg' });
    this.meta.updateTag({ property: 'og:type',        content: 'website' });

    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: 'Dan Luna Photo · Fotografía Profesional en Querétaro' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Estudio de fotografía profesional en Querétaro. Retratos, familias y mini sesiones especiales.' });
    this.meta.updateTag({ name: 'twitter:image',       content: 'https://danlunaphotos.com/assets/images/og-default.jpg' });

    if (isPlatformBrowser(this.platformId)) {
      this.injectJsonLd();
    }
  }

  private injectJsonLd(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LocalBusiness',
          '@id': 'https://danlunaphotos.com/#business',
          name: 'Dan Luna Photo',
          description: 'Estudio de fotografía profesional en Querétaro. Sesiones de retrato, familias, eventos y mini sesiones especiales.',
          url: 'https://danlunaphotos.com',
          telephone: '+52-56-6770-4976',
          image: 'https://danlunaphotos.com/assets/images/og-default.jpg',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Querétaro',
            addressRegion: 'Querétaro',
            addressCountry: 'MX'
          },
          sameAs: [
            'https://www.instagram.com/danlunaphotos',
            'https://www.facebook.com/people/Dan-Luna-Photo/61574229764276'
          ],
          priceRange: '$$'
        },
        {
          '@type': 'Organization',
          '@id': 'https://danlunaphotos.com/#organization',
          name: 'Dan Luna Photo',
          url: 'https://danlunaphotos.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://danlunaphotos.com/assets/images/DL.png'
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+52-56-6770-4976',
            contactType: 'customer service',
            availableLanguage: 'Spanish'
          }
        },
        {
          '@type': 'AggregateRating',
          '@id': 'https://danlunaphotos.com/#rating',
          itemReviewed: { '@id': 'https://danlunaphotos.com/#business' },
          ratingValue: '5',
          bestRating: '5',
          worstRating: '1',
          ratingCount: '3',
          reviewCount: '3'
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id   = 'home-jsonld';
    script.text  = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
