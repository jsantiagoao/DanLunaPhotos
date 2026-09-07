import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { AppImageComponent } from '../../../shared/ui/app-image/app-image.component';
import { CommonModule } from '@angular/common';

export interface CarouselPhoto {
  id: number;
  src: string;
  alt: string;
}

@Component({
  selector: 'app-mothers-day-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AppImageComponent],
  templateUrl: './mothers-day-carousel.component.html',
  styleUrl: './mothers-day-carousel.component.scss'
})
export class MothersDayCarouselComponent implements OnInit, OnDestroy {
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  readonly phrases: string[] = [
    'Un momento único, un recuerdo para siempre',
    'El amor de mamá, hecho fotografía',
    'Memorias que el corazón nunca olvida',
    'Un abrazo que dura toda la vida',
    'Donde el tiempo se detiene y el amor se vuelve eterno'
  ];

  readonly currentPhraseIndex = signal(0);
  readonly phraseVisible = signal(true);
  private phraseIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly currentPhrase = computed(() => this.phrases[this.currentPhraseIndex()]);

  readonly photos: CarouselPhoto[] = [
    {
      id: 1,
      src: 'assets/images/gallery/daniela-luna-fotografia1.jpg',
      alt: 'Madre e hijo en sesión fotográfica Día de las Madres'
    },
    {
      id: 2,
      src: 'assets/images/gallery/daniela-luna-fotografia2.jpg',
      alt: 'Familia disfrutando sesión de Día de las Madres'
    },
    {
      id: 3,
      src: 'assets/images/gallery/daniela-luna-fotografia3.jpg',
      alt: 'Retrato íntimo madre e hijos Día de las Madres'
    }
  ];

  readonly currentIndex = signal(0);
  isTransitioning = false;
  visiblePhotos = 4;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private touchThreshold = 50;

  ngOnInit() {
    this.startAutoScroll();
    this.startPhraseRotation();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.phraseIntervalId) clearInterval(this.phraseIntervalId);
  }

  startPhraseRotation() {
    this.phraseIntervalId = setInterval(() => {
      this.phraseVisible.set(false);
      setTimeout(() => {
        this.currentPhraseIndex.set((this.currentPhraseIndex() + 1) % this.phrases.length);
        this.phraseVisible.set(true);
      }, 700);
    }, 4500);
  }

  startAutoScroll() {
    this.intervalId = setInterval(() => {
      this.next();
    }, 6000);
  }

  prev() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const grid = this.carousel.nativeElement;
    grid.style.transition = 'transform 0.5s ease-in-out';
    grid.style.transform = `translateX(${100 / this.visiblePhotos}%)`;
    setTimeout(() => {
      this.currentIndex.set((this.currentIndex() - 1 + this.photos.length) % this.photos.length);
      grid.style.transition = 'none';
      grid.style.transform = 'translateX(0)';
      this.isTransitioning = false;
    }, 500);
  }

  next() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const grid = this.carousel.nativeElement;
    grid.style.transition = 'transform 0.5s ease-in-out';
    grid.style.transform = `translateX(-${100 / this.visiblePhotos}%)`;
    setTimeout(() => {
      this.currentIndex.set((this.currentIndex() + 1) % this.photos.length);
      grid.style.transition = 'none';
      grid.style.transform = 'translateX(0)';
      this.isTransitioning = false;
    }, 500);
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    const delta = this.touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(delta) < this.touchThreshold) return;
    delta > 0 ? this.next() : this.prev();
  }

  selectDot(index: number) {
    if (index === this.currentIndex() || this.isTransitioning) return;
    const diff = index - this.currentIndex();
    if (diff > 0) {
      for (let i = 0; i < diff; i++) this.next();
    } else {
      for (let i = 0; i < -diff; i++) this.prev();
    }
  }

  getVisiblePhotos() {
    const visible = [];
    for (let i = 0; i < this.visiblePhotos; i++) {
      visible.push(this.photos[(this.currentIndex() + i) % this.photos.length]);
    }
    return visible;
  }

  getDots() {
    return Array.from({ length: this.photos.length }, (_, i) => i);
  }
}
