import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PATHS = {
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  play: 'M6 3l14 9-14 9V3Z',
  close: 'M18 6 6 18M6 6l12 12',
  prev: 'M15 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
} as const;

export type GalleryIconName = keyof typeof PATHS;

/** Átomo: icono del visor. Decorativo: el nombre accesible lo lleva el botón que lo contiene. */
@Component({
  selector: 'app-gallery-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" [attr.fill]="filled() ? 'currentColor' : 'none'" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path [attr.d]="path()"></path>
    </svg>
  `,
  styles: [':host { display: inline-flex; } svg { display: block; }'],
})
export class GalleryIconComponent {
  readonly name = input.required<GalleryIconName>();
  readonly size = input(18);
  /** Relleno con el color del texto, p. ej. el corazón de una favorita. */
  readonly filled = input(false);
  protected readonly path = computed(() => PATHS[this.name()]);
}
