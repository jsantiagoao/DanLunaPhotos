import { Directive, ElementRef, NgZone, OnDestroy, PLATFORM_ID, afterNextRender, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { prefersReducedMotion } from './motion-env';
import { parallaxOffset } from './scroll-math';

/**
 * Parallax vertical: escribe --parallax (px) en el host según su posición en la ventana.
 * El SCSS decide qué mover con ella. Sin efecto en SSR y con movimiento reducido.
 *   <div dlParallax [parallaxStrength]="0.12">…</div>
 */
@Directive({ selector: '[dlParallax]', standalone: true })
export class ParallaxDirective implements OnDestroy {
  readonly parallaxStrength = input(0.12);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private teardown: (() => void) | null = null;

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser || prefersReducedMotion(window)) return;
      this.zone.runOutsideAngular(() => this.bind());
    });
  }

  private bind(): void {
    const host = this.el.nativeElement;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const r = host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      host.style.setProperty('--parallax', `${parallaxOffset(r.top, r.height, window.innerHeight, this.parallaxStrength()).toFixed(1)}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    this.teardown = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }

  ngOnDestroy(): void {
    this.teardown?.();
  }
}
