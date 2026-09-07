import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { INSTAGRAM_URL } from '../../../shared/contact-info';
import { AppImageComponent } from '../../../shared/ui/app-image/app-image.component';

export interface GalleryCard {
  num: string;
  name: string;
  count: string;
  image: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, AppImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, OnDestroy {
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  readonly cards: GalleryCard[] = [
    { num: '01', name: 'Bautizos',        count: 'Momentos sagrados, recuerdos eternos', image: 'assets/images/gallery/bautizo.jpg' },
    { num: '02', name: 'Bodas',           count: 'Fotografías para revivir tu gran día', image: 'assets/images/gallery/boda.jpg' },
    { num: '03', name: 'Smash the Cake',  count: 'La primera gran fiesta de tu bebé',    image: 'assets/images/gallery/smash-the-cake.jpg' },
    { num: '04', name: 'Sesión familiar', count: 'Amor en familia',                      image: 'assets/images/gallery/sesion-familiar.jpg' }
  ];

  currentIndex = 0;
  isTransitioning = false;
  visibleCards = 4;
  /** Portafolio real del estudio (fuente única en contact-info). */
  readonly instagramUrl = INSTAGRAM_URL;
  /** Precalculado: NO se llama desde el template para no re-evaluar en cada ciclo. */
  visible: GalleryCard[] = [];

  private intervalId: ReturnType<typeof setInterval> | null = null;
  /** Referencia estable del handler para poder removerlo en ngOnDestroy. */
  private readonly onResize = () => this.updateVisibleCards();

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.rebuildVisible();
      return;
    }
    this.updateVisibleCards();
    window.addEventListener('resize', this.onResize);
    this.startAutoScroll();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  private updateVisibleCards() {
    const width = window.innerWidth;
    if (width <= 600) this.visibleCards = 1;
    else if (width <= 900) this.visibleCards = 2;
    else if (width <= 1199) this.visibleCards = 3;
    else this.visibleCards = 4;
    this.rebuildVisible();
  }

  /** Recalcula las cards visibles una sola vez, cuando cambia el índice o el viewport. */
  private rebuildVisible() {
    const out: GalleryCard[] = [];
    for (let i = 0; i < this.visibleCards; i++) {
      out.push(this.cards[(this.currentIndex + i) % this.cards.length]);
    }
    this.visible = out;
    this.cdr.markForCheck();
  }

  private startAutoScroll() {
    this.intervalId = setInterval(() => this.next(), 3000);
  }

  prev() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const grid = this.carousel.nativeElement;
    const shift = 100 / this.visibleCards;
    grid.style.transition = 'transform 0.5s ease-in-out';
    grid.style.transform = `translateX(${shift}%)`;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
      grid.style.transition = 'none';
      grid.style.transform = 'translateX(0)';
      this.isTransitioning = false;
      this.rebuildVisible();
    }, 500);
  }

  next() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const grid = this.carousel.nativeElement;
    const shift = 100 / this.visibleCards;
    grid.style.transition = 'transform 0.5s ease-in-out';
    grid.style.transform = `translateX(-${shift}%)`;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
      grid.style.transition = 'none';
      grid.style.transform = 'translateX(0)';
      this.isTransitioning = false;
      this.rebuildVisible();
    }, 500);
  }
}
