import {
  Component, OnInit, OnDestroy, HostListener,
  Inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface Testimonial {
  stars: string;
  quote: string;
  name: string;
  type: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent implements OnInit, OnDestroy {

  readonly testimonials: Testimonial[] = [
    {
      stars: '★★★★★',
      quote: '"Dan captó exactamente lo que quería. Fue una experiencia increíble, las fotos superaron todas mis expectativas."',
      name: 'María G.',
      type: 'Sesión Retratos'
    },
    {
      stars: '★★★★★',
      quote: '"Nuestras fotos de boda son simplemente mágicas. Dan tiene ojo para los momentos únicos. ¡Los recomendamos al 100%!"',
      name: 'Lucía y Tomás R.',
      type: 'Boda — Nov. 2024'
    },
    {
      stars: '★★★★★',
      quote: '"Nunca me había sentido tan cómodo frente a una cámara. El resultado es increíble. Definitivamente repetiré."',
      name: 'Carlos M.',
      type: 'Sesión personal urbana'
    }
  ];

  currentIndex = 0;
  visibleCount = 3;

  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private isPaused = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateVisibleCount();
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateVisibleCount();
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
  }

  get maxIndex(): number {
    return Math.max(0, this.testimonials.length - this.visibleCount);
  }

  get trackTransform(): string {
    const slideWidth = 100 / this.visibleCount;
    return `translateX(-${this.currentIndex * slideWidth}%)`;
  }

  get dots(): number[] {
    return Array.from({ length: this.maxIndex + 1 }, (_, i) => i);
  }

  get cardWidth(): string {
    return `calc(${100 / this.visibleCount}% - ${this.visibleCount > 1 ? '16px' : '0px'})`;
  }

  get cardFlexBasis(): string {
    return `${100 / this.visibleCount}%`;
  }

  private updateVisibleCount(): void {
    const w = window.innerWidth;
    if (w >= 1024) {
      this.visibleCount = 3;
    } else if (w >= 640) {
      this.visibleCount = 2;
    } else {
      this.visibleCount = 1;
    }
  }

  prev(): void {
    this.currentIndex = this.currentIndex > 0
      ? this.currentIndex - 1
      : this.maxIndex;
    this.resetAutoplay();
  }

  next(): void {
    this.currentIndex = this.currentIndex < this.maxIndex
      ? this.currentIndex + 1
      : 0;
    this.resetAutoplay();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.resetAutoplay();
  }

  pauseAutoplay(): void {
    this.isPaused = true;
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    this.isPaused = false;
    this.startAutoplay();
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.stopAutoplay();
  }

  onTouchEnd(e: TouchEvent): void {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? this.next() : this.prev();
    }
    if (!this.isPaused) this.startAutoplay();
  }

  private startAutoplay(): void {
    if (this.maxIndex === 0) return;
    this.autoTimer = setInterval(() => this.next(), 5000);
  }

  private stopAutoplay(): void {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private resetAutoplay(): void {
    this.stopAutoplay();
    if (!this.isPaused) this.startAutoplay();
  }
}
