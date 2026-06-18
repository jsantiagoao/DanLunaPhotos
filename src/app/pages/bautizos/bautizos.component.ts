import { Component, OnInit, OnDestroy, Inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-bautizos',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoaderComponent, FooterComponent],
  templateUrl: './bautizos.component.html',
  styleUrl: './bautizos.component.scss'
})
export class BautizosComponent implements OnInit, OnDestroy, AfterViewInit {
  private jsonLdScript: HTMLScriptElement | null = null;
  private previousTitle = '';
  private observer: IntersectionObserver | null = null;

  @ViewChild('sentinel') sentinelRef!: ElementRef;

  sliderImages = [
    'assets/images/bautizos/slider/BAUTIZO-001.jpg',
    'assets/images/bautizos/slider/BAUTIZO-005.jpg',
    'assets/images/bautizos/slider/BAUTIZO-029.jpg',
    'assets/images/bautizos/slider/BAUTIZO-015.jpg',
    'assets/images/bautizos/slider/BAUTIZO-020.jpg',
  ];
  currentSlide = 0;
  private slideInterval: any;

  // Gallery
  allGalleryImages: { src: string; orientation: 'v' | 'h' }[] = [
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-001.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-002.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-003.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-004.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-005.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-006.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-007.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-008.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-009.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-011.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-012.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-013.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-014.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-015.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-016.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-017.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-018.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-019.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-020.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-021.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-022.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-023.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-025.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-026.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-027.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-028.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-029.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-030.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-031.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-032.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-033.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-034.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-035.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-036.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-038.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-039.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-040.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-041.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-042.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-043.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-044.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-045.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-047.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-048.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-050.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-054.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-055.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-056.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-057.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-058.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-059.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-060.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-061.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-062.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-063.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-064.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-065.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-066.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-067.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-068.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-069.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-070.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-072.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-073.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-075.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-076.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-077.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-078.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-079.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-080.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-081.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-082.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-083.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-085.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-086.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-087.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-088.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-089.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-090.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-091.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-093.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-094.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-095.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-097.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-098.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-099.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-100.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-101.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO-102.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BAUTIZO.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BautizoDavid-170.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BautizoDavid-175.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BautizoDavid-268.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/BautizoDavid-285.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BautizoDavid-292.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BautizoDavid-304.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/BautizoDavid-307.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Bautizo_Aura-042.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Bautizo_Aura-118.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/Bautizo_Aura-141.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-75.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-76.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-77.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-78.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-79.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-80.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-81.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-82.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-83.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-86.jpg', orientation: 'v'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-87.jpg', orientation: 'h'},
    {src: 'assets/images/bautizos/thumbs/Ede,Hugo & Uriel-88.jpg', orientation: 'v'},
  ];
  visibleImages: { src: string; orientation: 'v' | 'h' }[] = [];
  private galleryBatch = 20;
  private galleryPage = 1;
  loading = false;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.visibleImages = this.allGalleryImages.slice(0, this.galleryBatch);
  }

  ngOnInit(): void {
    this.previousTitle = this.titleService.getTitle();
    this.titleService.setTitle('Fotografía de Bautizo en Querétaro · Paquetes desde $1,850 | Dan Luna Photo');

    this.metaService.updateTag({
      name: 'description',
      content: 'Fotografía profesional de bautizo en Querétaro. Paquetes desde $1,850 MXN. ' +
        'Ceremonia, fiesta y fotos familiares. +70 fotos digitales editadas. Dan Luna Photo.'
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: 'fotografía de bautizo querétaro, fotógrafo bautizo querétaro, fotos bautizo querétaro, ' +
        'paquetes fotografía bautizo, sesión bautizo querétaro, fotógrafa bautizo, Dan Luna Photo, ' +
        'bautizo fotos profesionales querétaro, fotografía ceremonia bautizo'
    });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://danlunaphoto.com/fotografia-bautizo-queretaro');

    const ogImage = 'https://danlunaphoto.com/assets/images/bautizos/BAUTIZO-001.jpg';
    const ogTitle = '✝️ Fotografía de Bautizo en Querétaro · Dan Luna Photo';
    const ogDesc = 'Capturamos los momentos más sagrados del bautizo de tu bebé. Paquetes desde $1,850 MXN. Ceremonia + fiesta. Entrega digital en alta resolución.';

    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:locale', content: 'es_MX' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Dan Luna Photo' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://danlunaphoto.com/fotografia-bautizo-queretaro' });
    this.metaService.updateTag({ property: 'og:title', content: ogTitle });
    this.metaService.updateTag({ property: 'og:description', content: ogDesc });
    this.metaService.updateTag({ property: 'og:image', content: ogImage });

    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: ogTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: ogDesc });
    this.metaService.updateTag({ name: 'twitter:image', content: ogImage });

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
          name: 'Fotografía de Bautizo en Querétaro',
          description: 'Servicio de fotografía profesional para bautizos. Cobertura de ceremonia y fiesta con entrega digital.',
          provider: { '@id': 'https://danlunaphoto.com/#business' },
          areaServed: { '@type': 'City', name: 'Querétaro' },
          offers: [
            { '@type': 'Offer', name: 'Paquete Ceremonia', price: '1850', priceCurrency: 'MXN' },
            { '@type': 'Offer', name: 'Paquete Ceremonia + Fiesta 1h', price: '2850', priceCurrency: 'MXN' },
            { '@type': 'Offer', name: 'Paquete Ceremonia + Fiesta 2h', price: '3950', priceCurrency: 'MXN' }
          ]
        }
      ]
    });
    this.document.head.appendChild(this.jsonLdScript);

    this.startSlider();
  }

  ngOnDestroy(): void {
    this.titleService.setTitle(this.previousTitle);
    if (this.jsonLdScript) this.document.head.removeChild(this.jsonLdScript);
    if (this.slideInterval) clearInterval(this.slideInterval);
    if (this.observer) this.observer.disconnect();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMoreImages && !this.loading) {
          this.loadMoreImages();
        }
      },
      { rootMargin: '200px' }
    );
    if (this.sentinelRef) {
      this.observer.observe(this.sentinelRef.nativeElement);
    }
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.sliderImages.length;
    }, 4000);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.startSlider();
  }

  loadMoreImages(): void {
    if (this.loading) return;
    const nextBatch = this.allGalleryImages.slice(
      this.galleryPage * this.galleryBatch,
      (this.galleryPage + 1) * this.galleryBatch
    );
    if (nextBatch.length === 0) return;
    this.loading = true;
    setTimeout(() => {
      this.visibleImages = [...this.visibleImages, ...nextBatch];
      this.galleryPage++;
      this.loading = false;
    }, 200);
  }

  get hasMoreImages(): boolean {
    return this.visibleImages.length < this.allGalleryImages.length;
  }

  bookNow(): void {
    this.router.navigate(['/agendar']);
  }
}
