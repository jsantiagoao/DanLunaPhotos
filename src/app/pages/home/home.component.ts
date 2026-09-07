import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../../components/organisms/navbar/navbar.component';
import { LoaderComponent } from '../../components/molecules/loader/loader.component';
import { HeroComponent } from '../../components/molecules/hero/hero.component';
import { GalleryComponent } from '../../components/organisms/gallery/gallery.component';
import { AboutComponent } from '../../components/molecules/about/about.component';
import { TestimonialsComponent } from '../../components/organisms/testimonials/testimonials.component';
import { ContactComponent } from '../../components/organisms/contact/contact.component';
import { FooterComponent } from '../../components/organisms/footer/footer.component';
import { WHATSAPP_E164 } from '../../shared/contact-info';
import { SeoService } from '../../shared/seo/seo.service';

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
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private seo: SeoService) {}

  ngOnDestroy(): void {
    this.seo.clearJsonLd();
  }

  ngOnInit(): void {
    this.seo.apply({
      title: 'Dan Luna Photo · Fotografía Profesional en Querétaro',
      description: 'Dan Luna Photo — Estudio de fotografía profesional en Querétaro. Sesiones de retrato, familias, eventos y mini sesiones especiales. Capturamos los momentos que importan.',
      keywords: 'fotografía profesional querétaro, fotógrafa querétaro, sesiones de retrato querétaro, fotografía familiar querétaro, mini sesiones querétaro, Dan Luna Photo',
      url: 'https://danlunaphoto.com',
      image: 'https://danlunaphoto.com/assets/images/og-default.jpg',
      ogDescription: 'Estudio de fotografía profesional en Querétaro. Retratos, familias y mini sesiones especiales. Capturamos los momentos que importan.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'LocalBusiness',
            '@id': 'https://danlunaphoto.com/#business',
            name: 'Dan Luna Photo',
            description: 'Estudio de fotografía profesional en Querétaro. Sesiones de retrato, familias, eventos y mini sesiones especiales.',
            url: 'https://danlunaphoto.com',
            telephone: WHATSAPP_E164,
            image: 'https://danlunaphoto.com/assets/images/og-default.jpg',
            address: { '@type': 'PostalAddress', addressLocality: 'Querétaro', addressRegion: 'Querétaro', addressCountry: 'MX' },
            sameAs: [
              'https://www.instagram.com/danlunaphotos',
              'https://www.facebook.com/people/Dan-Luna-Photo/61574229764276'
            ],
            priceRange: '$$'
          },
          {
            '@type': 'Organization',
            '@id': 'https://danlunaphoto.com/#organization',
            name: 'Dan Luna Photo',
            url: 'https://danlunaphoto.com',
            logo: { '@type': 'ImageObject', url: 'https://danlunaphoto.com/assets/images/DL.png' },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: WHATSAPP_E164,
              contactType: 'customer service',
              availableLanguage: 'Spanish'
            }
          },
          {
            '@type': 'AggregateRating',
            '@id': 'https://danlunaphoto.com/#rating',
            itemReviewed: { '@id': 'https://danlunaphoto.com/#business' },
            ratingValue: '5', bestRating: '5', worstRating: '1', ratingCount: '3', reviewCount: '3'
          }
        ]
      }
    });
  }
}
