import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryCard {
  num: string;
  name: string;
  count: string;
  image: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, OnDestroy {
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;
  
  readonly cards: GalleryCard[] = [
    { num: '01', name: 'Día de las Madres',            count: 'Celebra a mamá con una sesión especial', image: 'assets/images/gallery/daniela-luna-fotografia1.jpg' },
    { num: '02', name: 'Bautizos',               count: 'Momentos sagrados, recuerdos eternos', image: 'assets/images/gallery/daniela-luna-fotografia2.jpg' },
    { num: '03', name: 'Bodas', count: 'Fotografías para revivir tu gran día', image: 'assets/images/gallery/daniela-luna-fotografia3.jpg' },
    { num: '04', name: 'Smash the Cake',count: 'La primera gran fiesta de tu bebé', image: 'assets/images/gallery/daniela-luna-fotografia4.jpg' },
    { num: '05', name: 'Sesión en Pareja',             count: 'Retratos que cuentan su historia', image: 'assets/images/gallery/daniela-luna-fotografia1.jpg' }
  ];

  currentIndex = 0;
  isTransitioning = false;
  visibleCards = 4;
  private intervalId: any;

  ngOnInit() {
    this.updateVisibleCards();
    window.addEventListener('resize', () => this.updateVisibleCards());
    this.startAutoScroll();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.removeEventListener('resize', () => this.updateVisibleCards());
  }

  updateVisibleCards() {
    const width = window.innerWidth;
    if (width <= 600) {
      this.visibleCards = 1;
    } else if (width <= 900) {
      this.visibleCards = 2;
    } else if (width <= 1199) {
      this.visibleCards = 3;
    } else {
      this.visibleCards = 4;
    }
  }

  startAutoScroll() {
    this.intervalId = setInterval(() => {
      this.next();
    }, 3000);
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
    }, 500);
  }

  getVisibleCards() {
    const visible = [];
    for (let i = 0; i < this.visibleCards; i++) {
      visible.push(this.cards[(this.currentIndex + i) % this.cards.length]);
    }
    return visible;
  }
}
