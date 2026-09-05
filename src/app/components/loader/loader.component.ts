import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

/** Marca de "ya lo viste" — por sesion, no por siempre: la animacion es parte de la marca. */
export const LOADER_SESSION_KEY = 'dl_loader_seen';

/** Cuanto se ve el trazo completo antes de empezar a desaparecer. */
export const LOADER_VISIBLE_MS = 900;

/** Fade de salida. Debe coincidir con la transicion de .loader en el SCSS. */
export const LOADER_FADE_MS = 300;

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit, OnDestroy {
  /**
   * Arranca en false a proposito: el loader es la excepcion, no el estado por
   * defecto. Angular llama ngOnInit antes de renderizar la vista, asi que quien
   * si deba verlo no percibe parpadeo.
   */
  isLoading = false;
  isExiting = false;

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // La decision se toma antes de marcar: al reves, markSeen() haria que
    // shouldPlay() leyera su propia escritura y el loader no saldria nunca.
    const play = this.shouldPlay();
    this.markSeen();
    if (!play) return;

    this.isLoading = true;
    this.timers.push(setTimeout(() => {
      this.isExiting = true;
      this.timers.push(setTimeout(() => (this.isLoading = false), LOADER_FADE_MS));
    }, LOADER_VISIBLE_MS));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  /** Primera visita de la sesion y sin preferencia de movimiento reducido. */
  private shouldPlay(): boolean {
    return !this.seen && !this.prefersReducedMotion();
  }

  private get seen(): boolean {
    // sessionStorage lanza en navegacion privada de Safari. Si no podemos leer,
    // asumimos que no se ha visto: animar de mas es mejor que romper el home.
    try {
      return sessionStorage.getItem(LOADER_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  }

  private markSeen(): void {
    try {
      sessionStorage.setItem(LOADER_SESSION_KEY, '1');
    } catch {
      /* sin sessionStorage el loader se repite; no es motivo para fallar */
    }
  }

  private prefersReducedMotion(): boolean {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
