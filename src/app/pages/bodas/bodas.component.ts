import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/organisms/navbar/navbar.component';
import { FooterComponent } from '../../components/organisms/footer/footer.component';
import { LoaderComponent } from '../../components/molecules/loader/loader.component';
import { WHATSAPP_E164 } from '../../shared/contact-info';
import { SeoService } from '../../shared/seo/seo.service';
import { AppImageComponent } from '../../shared/ui/app-image/app-image.component';
import { CarouselComponent } from '../../shared/ui/carousel/carousel.component';

@Component({
  selector: 'app-bodas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, LoaderComponent, AppImageComponent, CarouselComponent],
  templateUrl: './bodas.component.html',
  styleUrl: './bodas.component.scss'
})
export class BodasComponent implements OnInit, OnDestroy {
  sliderImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&h=1080&fit=crop',
  ];
  sliderMobileImages = [
    'assets/images/bodas/slider-mobile/slider-mobile-1.jpg',
    'assets/images/bodas/slider-mobile/slider-mobile-2.jpg',
  ];
  isMobile = window.innerWidth <= 768;

  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.apply({
      title: 'Fotografía de Bodas en Querétaro · Fotógrafa Profesional | Dan Luna Photo',
      description: 'Fotografía profesional de bodas en Querétaro. Documentamos tu historia de amor con pasión y creatividad. Cobertura de ceremonia, fiesta y sesión de novios. Cotiza sin compromiso.',
      keywords: 'fotografía de bodas querétaro, fotógrafo de bodas querétaro, fotógrafa bodas querétaro, fotos de boda querétaro, sesión de novios querétaro, fotografía nupcial querétaro, paquetes fotografía boda, Dan Luna Photo',
      url: 'https://danlunaphoto.com/fotografia-bodas-queretaro',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=630&fit=crop',
      ogTitle: '💍 Fotografía de Bodas en Querétaro · Dan Luna Photo',
      ogDescription: 'Documentamos historias de amor que se convierten en fotografías. Cotiza tu boda sin compromiso.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'LocalBusiness',
            '@id': 'https://danlunaphoto.com/#business',
            name: 'Dan Luna Photo',
            url: 'https://danlunaphoto.com',
            telephone: WHATSAPP_E164,
            address: { '@type': 'PostalAddress', addressLocality: 'Querétaro', addressRegion: 'Querétaro', addressCountry: 'MX' }
          },
          {
            '@type': 'Service',
            name: 'Fotografía de Bodas en Querétaro',
            description: 'Servicio de fotografía profesional para bodas. Cobertura de ceremonia religiosa, civil, fiesta y sesión de novios.',
            provider: { '@id': 'https://danlunaphoto.com/#business' },
            areaServed: { '@type': 'City', name: 'Querétaro' }
          }
        ]
      }
    });
  }

  ngOnDestroy(): void {
    this.seo.clearJsonLd();
  }

  scrollToGallery(): void {
    document.querySelector('#galeria')?.scrollIntoView({ behavior: 'smooth' });
  }
}
