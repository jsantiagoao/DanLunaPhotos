import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppImageComponent } from '../../shared/ui/app-image/app-image.component';
import { NavbarComponent } from '../../components/organisms/navbar/navbar.component';
import { FooterComponent } from '../../components/organisms/footer/footer.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/atoms/breadcrumb/breadcrumb.component';
import { WHATSAPP_E164 } from '../../shared/contact-info';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-fotografa-en-queretaro',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, BreadcrumbComponent, AppImageComponent],
  templateUrl: './fotografa-en-queretaro.component.html',
  styleUrl: './fotografa-en-queretaro.component.scss'
})
export class FotografaEnQueretaroComponent implements OnInit, OnDestroy {

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Fotógrafa en Querétaro' }
  ];

  constructor(private seo: SeoService) {}

  ngOnDestroy(): void {
    this.seo.clearJsonLd();
  }

  ngOnInit(): void {
    this.seo.apply({
      title: 'Daniela Luna · Fotógrafa Profesional en Querétaro | Dan Luna Photo',
      description: 'Soy Daniela Luna, fotógrafa profesional en Querétaro con base en arquitectura y narrativa visual. Retratos, familias y sesiones especiales con intención y alma.',
      keywords: 'fotógrafa profesional querétaro, Daniela Luna fotógrafa, fotografía de retrato querétaro, fotografía familiar querétaro, fotógrafa arquitectura querétaro, Dan Luna Photo',
      url: 'https://danlunaphoto.com/fotografa-en-queretaro',
      image: 'https://danlunaphoto.com/assets/images/Daniela_Luna_Fotografa-1024x776.jpg',
      ogTitle: 'Daniela Luna · Fotógrafa en Querétaro | Dan Luna Photo',
      ogDescription: 'Fotografía con arquitectura y alma. Daniela Luna — fotógrafa profesional en Querétaro.',
      jsonLd: {
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
            address: { '@type': 'PostalAddress', addressLocality: 'Querétaro', addressRegion: 'Querétaro', addressCountry: 'MX' }
          },
          {
            '@type': 'LocalBusiness',
            '@id': 'https://danlunaphoto.com/#business',
            name: 'Dan Luna Photo',
            url: 'https://danlunaphoto.com',
            telephone: WHATSAPP_E164,
            address: { '@type': 'PostalAddress', addressLocality: 'Querétaro', addressRegion: 'Querétaro', addressCountry: 'MX' }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://danlunaphoto.com' },
              { '@type': 'ListItem', position: 2, name: 'Fotógrafa en Querétaro', item: 'https://danlunaphoto.com/fotografa-en-queretaro' }
            ]
          }
        ]
      }
    });
  }
}
