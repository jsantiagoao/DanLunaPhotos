import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-bodas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, LoaderComponent],
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
  currentSlide = 0;
  private slideInterval: any;
  private jsonLdScript: HTMLScriptElement | null = null;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.startSlider();

    this.titleService.setTitle('Fotografía de Bodas en Querétaro · Fotógrafa Profesional | Dan Luna Photo');

    this.metaService.updateTag({ name: 'description', content: 'Fotografía profesional de bodas en Querétaro. Documentamos tu historia de amor con pasión y creatividad. Cobertura de ceremonia, fiesta y sesión de novios. Cotiza sin compromiso.' });
    this.metaService.updateTag({ name: 'keywords', content: 'fotografía de bodas querétaro, fotógrafo de bodas querétaro, fotógrafa bodas querétaro, fotos de boda querétaro, sesión de novios querétaro, fotografía nupcial querétaro, paquetes fotografía boda, Dan Luna Photo' });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = this.document.createElement('link'); canonical.setAttribute('rel', 'canonical'); this.document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://danlunaphoto.com/fotografia-bodas-queretaro');

    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:locale', content: 'es_MX' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Dan Luna Photo' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://danlunaphoto.com/fotografia-bodas-queretaro' });
    this.metaService.updateTag({ property: 'og:title', content: '💍 Fotografía de Bodas en Querétaro · Dan Luna Photo' });
    this.metaService.updateTag({ property: 'og:description', content: 'Documentamos historias de amor que se convierten en fotografías. Cotiza tu boda sin compromiso.' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=630&fit=crop' });

    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'Fotografía de Bodas en Querétaro · Dan Luna Photo' });
    this.metaService.updateTag({ name: 'twitter:description', content: 'Documentamos historias de amor que se convierten en fotografías.' });

    this.jsonLdScript = this.document.createElement('script');
    this.jsonLdScript.type = 'application/ld+json';
    this.jsonLdScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LocalBusiness',
          '@id': 'https://danlunaphoto.com/#business',
          name: 'Dan Luna Photo',
          url: 'https://danlunaphoto.com',
          telephone: '+525667704976',
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
    });
    this.document.head.appendChild(this.jsonLdScript);
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
    if (this.jsonLdScript) this.document.head.removeChild(this.jsonLdScript);
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.sliderImages.length;
    }, 5000);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.startSlider();
  }

  scrollToGallery(): void {
    document.querySelector('#galeria')?.scrollIntoView({ behavior: 'smooth' });
  }
}
