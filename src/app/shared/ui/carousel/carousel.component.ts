import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppImageComponent } from '../app-image/app-image.component';
import { ImageProfileName } from '../app-image/image-profiles';
import { nextIndex } from './carousel.logic';

/**
 * Organism reutilizable: slider con autoplay, fade y dots.
 *
 * Reemplaza la logica de slider duplicada en bautizos/bodas (DRY). La rotacion
 * circular vive en carousel.logic.ts (pura, testeable). Sirve las imagenes con
 * el atomo AppImage (composicion), asi hereda webp + srcset automaticamente.
 *
 * Single Responsibility: SOLO rota imagenes. No sabe de SEO, rutas ni negocio.
 *
 *   <app-carousel [images]="fotos" alt="Boda" [interval]="5000" profile="hero" />
 */
@Component({
  selector: 'app-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppImageComponent],
  template: `
    <div class="carousel" role="region" aria-roledescription="carrusel" [attr.aria-label]="alt()">
      @for (img of images(); track img; let i = $index) {
        <div
          class="carousel__slide"
          [class.carousel__slide--active]="i === current()"
          [attr.aria-hidden]="i === current() ? null : 'true'"
        >
          <app-image
            [src]="img"
            [alt]="altFor(i)"
            [profile]="profile()"
            [lazy]="i !== 0"
          />
        </div>
      }

      @if (images().length > 1) {
        <div class="carousel__dots" role="tablist">
          @for (img of images(); track img; let i = $index) {
            <button
              class="carousel__dot"
              [class.carousel__dot--active]="i === current()"
              [attr.aria-label]="'Ir a la imagen ' + (i + 1)"
              [attr.aria-selected]="i === current()"
              (click)="goTo(i)"
            ></button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .carousel { position: relative; width: 100%; height: 100%; overflow: hidden; }
    .carousel__slide {
      position: absolute; inset: 0;
      opacity: 0; transition: opacity 1.2s ease-in-out;
    }
    .carousel__slide--active { opacity: 1; }
    .carousel__dots {
      position: absolute; bottom: 1.5rem; left: 0; right: 0; z-index: 2;
      display: flex; justify-content: center; gap: 0.6rem;
    }
    .carousel__dot {
      width: 10px; height: 10px; border-radius: 50%;
      border: none; cursor: pointer; padding: 0;
      background: rgba(255, 255, 255, 0.5); transition: background 0.3s;
    }
    .carousel__dot--active { background: #fff; }
  `],
})
export class CarouselComponent implements OnInit, OnDestroy {
  /** Rutas de las imagenes raster (jpg/jpeg/png). AppImage deriva webp/srcset. */
  readonly images = input.required<string[]>();
  /** Texto alternativo base; se le agrega la posicion por accesibilidad. */
  readonly alt = input('');
  /** Intervalo de autoplay en ms. */
  readonly interval = input(5000);
  /** Perfil responsive para AppImage (hero por defecto: slider a full width). */
  readonly profile = input<ImageProfileName | ''>('hero');

  readonly current = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  /** alt accesible por slide: "Boda 1", "Boda 2"... */
  altFor(i: number): string {
    return `${this.alt()} ${i + 1}`.trim();
  }

  next(): void {
    this.current.set(nextIndex(this.current(), this.images().length));
  }

  goTo(index: number): void {
    this.current.set(index);
    this.restart();
  }

  private start(): void {
    if (!this.isBrowser || this.images().length <= 1) return;
    this.timer = setInterval(() => this.next(), this.interval());
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restart(): void {
    this.stop();
    this.start();
  }
}
