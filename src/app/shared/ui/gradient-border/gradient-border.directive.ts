import { Directive, ElementRef, HostListener, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Efecto "contorno": pinta un borde de gradiente que sigue al cursor sobre el elemento.
 *
 * No usa librerías: escribe dos custom properties (--gb-x / --gb-y, en %) que el CSS del
 * componente usa para posicionar un radial-gradient en el borde. Solo actúa en navegador
 * (SSR-safe) y con puntero fino (mouse); en táctil deja un borde estático definido por CSS.
 *
 * Uso: <div appGradientBorder class="mi-card">…</div> + el CSS de la clase reacciona a las vars.
 */
@Directive({
  selector: '[appGradientBorder]',
  standalone: true,
})
export class GradientBorderDirective implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    if (this.isBrowser) {
      this.host.nativeElement.classList.add('has-gradient-border');
    }
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.isBrowser || event.pointerType === 'touch') return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    const { x, y } = GradientBorderDirective.relativePosition(event.clientX, event.clientY, rect);
    const el = this.host.nativeElement;
    el.style.setProperty('--gb-x', `${(x * 100).toFixed(2)}%`);
    el.style.setProperty('--gb-y', `${(y * 100).toFixed(2)}%`);
  }

  /**
   * Posición del puntero relativa al elemento, normalizada a [0,1] en cada eje.
   * Pura: recibe coordenadas y el rect; recorta lo que caiga fuera del elemento.
   */
  static relativePosition(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }): { x: number; y: number } {
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    return {
      x: clamp((clientX - rect.left) / rect.width),
      y: clamp((clientY - rect.top) / rect.height),
    };
  }
}
