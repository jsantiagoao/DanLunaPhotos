import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/organisms/navbar/navbar.component';
import { LoaderComponent } from '../../components/molecules/loader/loader.component';
import { FooterComponent } from '../../components/organisms/footer/footer.component';
import { WHATSAPP_E164 } from '../../shared/contact-info';
import { SeoService } from '../../shared/seo/seo.service';
import { AppImageComponent } from '../../shared/ui/app-image/app-image.component';
import { CarouselComponent } from '../../shared/ui/carousel/carousel.component';
import { BAUTIZOS_SLIDER_IMAGES, BAUTIZOS_GALLERY_IMAGES, GalleryThumb } from './bautizos.data';

@Component({
  selector: 'app-bautizos',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoaderComponent, FooterComponent, AppImageComponent, CarouselComponent],
  templateUrl: './bautizos.component.html',
  styleUrl: './bautizos.component.scss'
})
export class BautizosComponent implements OnInit, OnDestroy, AfterViewInit {
  private previousTitle = '';
  private observer: IntersectionObserver | null = null;

  @ViewChild('sentinel') sentinelRef!: ElementRef;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  sliderImages = BAUTIZOS_SLIDER_IMAGES;

  // Gallery (datos en bautizos.data.ts)
  allGalleryImages: GalleryThumb[] = BAUTIZOS_GALLERY_IMAGES;
  visibleImages: GalleryThumb[] = [];
  private galleryBatch = 20;
  private galleryPage = 1;
  loading = false;

  constructor(
    private titleService: Title,
    private seo: SeoService,
    private router: Router,
  ) {
    this.visibleImages = this.allGalleryImages.slice(0, this.galleryBatch);
  }

  ngOnInit(): void {
    this.previousTitle = this.titleService.getTitle();
    this.seo.apply({
      title: 'Fotografía de Bautizo en Querétaro · Paquetes desde $1,850 | Dan Luna Photo',
      description: 'Fotografía profesional de bautizo en Querétaro. Paquetes desde $1,850 MXN. ' +
        'Ceremonia, fiesta y fotos familiares. +70 fotos digitales editadas. Dan Luna Photo.',
      keywords: 'fotografía de bautizo querétaro, fotógrafo bautizo querétaro, fotos bautizo querétaro, ' +
        'paquetes fotografía bautizo, sesión bautizo querétaro, fotógrafa bautizo, Dan Luna Photo, ' +
        'bautizo fotos profesionales querétaro, fotografía ceremonia bautizo',
      url: 'https://danlunaphoto.com/fotografia-bautizo-queretaro',
      image: 'https://danlunaphoto.com/assets/images/bautizos/BAUTIZO-001.jpg',
      ogTitle: '✝️ Fotografía de Bautizo en Querétaro · Dan Luna Photo',
      ogDescription: 'Capturamos los momentos más sagrados del bautizo de tu bebé. Paquetes desde $1,850 MXN. Ceremonia + fiesta. Entrega digital en alta resolución.',
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
      }
    });
  }

  ngOnDestroy(): void {
    this.titleService.setTitle(this.previousTitle);
    this.seo.clearJsonLd();
    if (this.observer) this.observer.disconnect();
  }

  ngAfterViewInit(): void {
    // IntersectionObserver solo existe en el navegador; en prerender (server)
    // no hay scroll infinito que observar.
    if (!this.isBrowser) return;
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
