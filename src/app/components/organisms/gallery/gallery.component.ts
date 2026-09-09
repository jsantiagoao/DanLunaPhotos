import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { INSTAGRAM_URL } from '../../../shared/contact-info';
import { AppImageComponent } from '../../../shared/ui/app-image/app-image.component';

export interface GalleryCard {
  num: string;
  name: string;
  count: string;
  image: string;
}

/** Posición visual de una card respecto a la activa en el coverflow 3D. */
export type CardPosition = 'center' | 'left' | 'right' | 'far-left' | 'far-right' | 'hidden';

/** Card con su posición ya resuelta, para que el template no calcule nada. */
export interface PositionedCard {
  card: GalleryCard;
  position: CardPosition;
}

/**
 * Sesiones Destacadas — carrusel "coverflow" 3D: la sesión activa se muestra grande y al
 * frente; las vecinas, escaladas y atenuadas detrás. La lógica de posición es pura
 * (positionFor) para poder probarla sin renderizar. Autoplay solo en navegador (SSR-safe).
 */
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, AppImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, OnDestroy {
  readonly cards: GalleryCard[] = [
    { num: '01', name: 'Bautizos',        count: 'Momentos sagrados, recuerdos eternos', image: 'assets/images/gallery/bautizo.jpg' },
    { num: '02', name: 'Bodas',           count: 'Fotografías para revivir tu gran día', image: 'assets/images/gallery/boda.jpg' },
    { num: '03', name: 'Smash the Cake',  count: 'La primera gran fiesta de tu bebé',    image: 'assets/images/gallery/smash-the-cake.jpg' },
    { num: '04', name: 'Sesión familiar', count: 'Amor en familia',                      image: 'assets/images/gallery/sesion-familiar.jpg' }
  ];

  /** Índice de la card al frente. */
  readonly currentIndex = signal(0);

  /** Cada card con su posición resuelta respecto a la activa (para el template). */
  readonly positioned = computed<PositionedCard[]>(() =>
    this.cards.map((card, i) => ({ card, position: this.positionFor(i, this.currentIndex(), this.cards.length) }))
  );

  /** La card actualmente al frente; su info se muestra bajo el carrusel. */
  readonly activeCard = computed(() => this.cards[this.currentIndex()]);

  readonly instagramUrl = INSTAGRAM_URL;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.isBrowser) this.startAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  /**
   * Posición de la card `i` cuando la activa es `active`, en un anillo de `total` cards.
   * Función pura: distancia circular con signo -> center / (far-)left / (far-)right.
   */
  positionFor(i: number, active: number, total: number): CardPosition {
    let diff = i - active;
    // Distancia circular con signo: el camino más corto alrededor del anillo.
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    switch (diff) {
      case 0: return 'center';
      case 1: return 'right';
      case -1: return 'left';
      case 2: return 'far-right';
      case -2: return 'far-left';
      default: return 'hidden';
    }
  }

  select(index: number): void {
    this.currentIndex.set(index);
    this.restartAutoScroll();
  }

  prev(): void {
    const n = this.cards.length;
    this.currentIndex.update((i) => (i - 1 + n) % n);
    this.restartAutoScroll();
  }

  next(): void {
    const n = this.cards.length;
    this.currentIndex.update((i) => (i + 1) % n);
    this.restartAutoScroll();
  }

  // ── Swipe táctil (móvil) ───────────────────────────────
  /** Umbral mínimo en px para considerar el gesto un swipe y no un tap. */
  private static readonly SWIPE_THRESHOLD = 40;
  private touchStartX: number | null = null;

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? this.touchStartX;
    const dir = this.swipeDirection(this.touchStartX, endX);
    this.touchStartX = null;
    // Swipe a la izquierda → siguiente; a la derecha → anterior (como en apps nativas).
    if (dir === 'left') this.next();
    else if (dir === 'right') this.prev();
  }

  /**
   * Traduce el desplazamiento horizontal en dirección de navegación. Pura y testeable:
   * ignora gestos por debajo del umbral (tap o micro-movimiento).
   */
  swipeDirection(startX: number, endX: number): 'left' | 'right' | 'none' {
    const delta = endX - startX;
    if (Math.abs(delta) < GalleryComponent.SWIPE_THRESHOLD) return 'none';
    return delta < 0 ? 'left' : 'right';
  }

  private startAutoScroll(): void {
    this.intervalId = setInterval(() => this.next(), 4000);
  }

  private stopAutoScroll(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Tras interacción manual, reinicia el temporizador para no saltar de inmediato. */
  private restartAutoScroll(): void {
    if (!this.isBrowser) return;
    this.stopAutoScroll();
    this.startAutoScroll();
  }
}
