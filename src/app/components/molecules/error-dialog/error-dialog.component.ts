import {
  ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, input, output, viewChild,
} from '@angular/core';

let nextId = 0;

/**
 * Modal de error de un formulario. Se muestra mientras `message` tenga texto y avisa
 * con `dismissed` cuando la clienta lo cierra (botón, Escape o clic fuera); quien lo
 * usa decide a qué campo llevar el foco después.
 *
 * Existe porque el mensaje general quedaba hasta arriba de la página, lejos del botón
 * que lo provocaba, y la clienta creía que "Reservar" no funcionaba.
 */
@Component({
  selector: 'app-error-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss',
})
export class ErrorDialogComponent {
  readonly message = input<string | null>(null);
  readonly title = input('Revisa tus datos');
  readonly dismissed = output<void>();

  protected readonly titleId = `error-dialog-title-${++nextId}`;
  protected readonly messageId = `error-dialog-message-${nextId}`;

  private readonly button = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    // Al abrirse, el foco va al botón: el lector de pantalla anuncia el mensaje y
    // Enter lo cierra sin buscar el botón.
    afterRenderEffect(() => this.button()?.nativeElement.focus());
  }

  protected close(): void {
    this.dismissed.emit();
  }

  protected closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }
}
