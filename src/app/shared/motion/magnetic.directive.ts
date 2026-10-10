import { Directive, input } from '@angular/core';
import { PointerEffect } from './pointer-effect';
import { magneticOffset, Ratio } from './motion-math';

/**
 * Botón "magnético": se acerca unos píxeles al puntero y vuelve al soltarlo.
 *   <a dlMagnetic [magneticStrength]="10">Reservar sesión</a>
 */
@Directive({ selector: '[dlMagnetic]', standalone: true, host: { class: 'dl-magnetic' } })
export class MagneticDirective extends PointerEffect {
  readonly magneticStrength = input(10);

  protected apply(node: HTMLElement, r: Ratio): void {
    const o = magneticOffset(r, this.magneticStrength());
    node.style.transform = `translate3d(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px, 0)`;
  }

  protected reset(node: HTMLElement): void {
    node.style.transform = '';
  }
}
