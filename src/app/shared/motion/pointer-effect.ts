import { Directive, ElementRef, NgZone, OnDestroy, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { allowsPointerEffects } from './motion-env';
import { pointerRatio, Ratio } from './motion-math';

/**
 * Base de los efectos de puntero (patrón Template Method): engancha pointermove/leave
 * fuera de la zona de Angular, limita a un cálculo por frame y delega en `apply` /
 * `reset`. Solo se activa con mouse y sin movimiento reducido; en SSR no hace nada.
 */
@Directive()
export abstract class PointerEffect implements OnDestroy {
  protected readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private frame = 0;
  private teardown: (() => void) | null = null;

  protected abstract apply(node: HTMLElement, ratio: Ratio): void;
  protected abstract reset(node: HTMLElement): void;

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser || !allowsPointerEffects(window)) return;
      const node = this.el.nativeElement;
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() =>
          this.apply(node, pointerRatio(e.clientX, e.clientY, node.getBoundingClientRect())));
      };
      const onLeave = () => {
        cancelAnimationFrame(this.frame);
        this.reset(node);
      };
      this.zone.runOutsideAngular(() => {
        node.addEventListener('pointermove', onMove, { passive: true });
        node.addEventListener('pointerleave', onLeave);
      });
      this.teardown = () => {
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerleave', onLeave);
      };
    });
  }

  ngOnDestroy(): void {
    if (!this.teardown) return;
    cancelAnimationFrame(this.frame);
    this.teardown();
  }
}
