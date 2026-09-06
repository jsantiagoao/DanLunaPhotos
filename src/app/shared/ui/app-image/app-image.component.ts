import { Component, ChangeDetectionStrategy, computed, input, signal } from '@angular/core';
import { toWebp } from './to-webp';

/**
 * Atomo (atomic design): imagen responsive con webp + fallback raster.
 *
 * Unico punto donde vive la regla "servir webp con <picture>, caer al jpg si el
 * navegador no soporta webp" (DRY). Agregar AVIF o srcset en el futuro se hace
 * aqui sin tocar a los consumidores (Open/Closed).
 *
 * Sin logica de negocio: solo presentacion + props (Single Responsibility).
 *
 *   <app-image src="assets/images/gallery/boda.jpg" alt="Boda" />
 *   <app-image [src]="hero" alt="Hero" [lazy]="false" />   // above-the-fold
 */
@Component({
  selector: 'app-image',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <picture class="app-image">
      @if (!failed()) {
        <source [attr.srcset]="webp()" type="image/webp" />
      }
      <img
        [attr.src]="src()"
        [attr.alt]="alt()"
        [attr.loading]="lazy() ? 'lazy' : 'eager'"
        [attr.decoding]="lazy() ? 'async' : 'auto'"
        [attr.fetchpriority]="lazy() ? 'auto' : 'high'"
        (error)="onError()"
      />
    </picture>
  `,
  styles: [`
    /* El host llena su contenedor de forma transparente: el layout lo controla
       el padre (position/size). Asi <app-image> es un reemplazo directo de <img>
       para los selectores existentes tipo ".slide img" o ".cta-bg img". */
    :host { display: block; width: 100%; height: 100%; }
    picture { display: block; width: 100%; height: 100%; }
    img { display: block; width: 100%; height: 100%; object-fit: cover; }
  `],
})
export class AppImageComponent {
  /** Ruta del raster original (jpg/jpeg/png). El webp se deriva de aqui. */
  readonly src = input.required<string>();
  /** Texto alternativo. Obligatorio por accesibilidad. */
  readonly alt = input.required<string>();
  /** true (por defecto) → loading=lazy. false para imagenes above-the-fold. */
  readonly lazy = input(true);

  /** Ruta del hermano webp, derivada de src. */
  readonly webp = computed(() => toWebp(this.src()));

  /** Si el <img> dispara error (p.ej. webp inexistente y el navegador no cayo
      solo), se retira el <source webp> para forzar el jpg. Defensa en fondo:
      lo normal es que todo jpg tenga su webp (ver scripts/generate-webp.py). */
  readonly failed = signal(false);

  onError(): void {
    if (!this.failed()) this.failed.set(true);
  }
}
