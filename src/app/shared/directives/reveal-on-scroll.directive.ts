import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * RevealOnScrollDirective — átomo de comportamiento reutilizable.
 *
 * Anima la entrada de un elemento cuando aparece en el viewport usando
 * IntersectionObserver. No contiene lógica de negocio (SRP): sólo alterna
 * clases CSS (`reveal` / `reveal--visible`) y delega la animación al SCSS.
 *
 * Garantías:
 *  - SSR-safe: en servidor revela de inmediato (no oculta contenido sin JS).
 *  - Accesible: si el usuario prefiere movimiento reducido, revela sin animar.
 *  - Una sola vez: al revelarse deja de observar (no re-anima al re-entrar).
 *
 * Uso: `<section appReveal [revealDelay]="120"> ... </section>`
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  /** Retraso (ms) antes de revelar, útil para escalonar (stagger) secciones. */
  @Input() revealDelay = 0;
  /** Fracción del elemento visible que dispara la animación (0–1). */
  @Input() revealThreshold = 0.15;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;

    // En servidor no hay viewport: mostramos el contenido tal cual para que
    // sea visible sin JS y no perjudique SEO/LCP.
    if (!isPlatformBrowser(this.platformId)) {
      node.classList.add('reveal--visible');
      return;
    }

    node.classList.add('reveal');

    // Respeta la preferencia de accesibilidad: sin animación de entrada.
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      this.reveal(node);
      return;
    }

    // Si el navegador no soporta IntersectionObserver, degradamos revelando.
    if (typeof IntersectionObserver === 'undefined') {
      this.reveal(node);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.reveal(entry.target as HTMLElement);
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: this.revealThreshold },
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private reveal(node: HTMLElement): void {
    if (this.revealDelay > 0) {
      node.style.transitionDelay = `${this.revealDelay}ms`;
    }
    node.classList.add('reveal--visible');
  }
}
