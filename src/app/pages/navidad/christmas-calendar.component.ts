import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { buildChristmasMonth } from './christmas-calendar.model';
import { availableSlots, type BusyInterval } from './christmas-slots';

/**
 * Organismo: elegir dia y horario de la sesion navideña.
 *
 * Solo presenta. Que dias se pueden tocar y que huecos quedan libres lo deciden
 * `buildChristmasMonth` y `availableSlots`, que son funciones puras con sus propias
 * pruebas. Aqui no hay ninguna regla escondida.
 *
 * La rejilla es de 25 minutos porque la sesion dura 20; por eso no se reusa el
 * calendario de `/agendar`, que razona por horas.
 */
@Component({
  selector: 'app-christmas-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="xmas-calendar">
      <div class="cal">
        <header class="cal__head">
          <button type="button" class="cal__nav" [disabled]="!month().canGoBack"
                  aria-label="Mes anterior" (click)="monthChange.emit(-1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h3 class="cal__month">{{ month().label }}</h3>
          <button type="button" class="cal__nav" aria-label="Mes siguiente" (click)="monthChange.emit(1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </header>

        <div class="cal__grid" role="grid">
          @for (d of weekdays; track d) { <span class="cal__weekday" role="columnheader">{{ d }}</span> }

          @for (cell of month().cells; track $index) {
            @if (cell.day === null) {
              <span class="cal__blank" aria-hidden="true"></span>
            } @else {
              <button type="button" class="cal__day"
                      [class.is-selected]="cell.dateKey === selectedDate()"
                      [class.is-full]="cell.full"
                      [class.is-closed]="cell.closed"
                      [disabled]="!cell.selectable"
                      [attr.aria-pressed]="cell.dateKey === selectedDate()"
                      [attr.aria-label]="dayLabel(cell)"
                      (click)="dateSelect.emit(cell.dateKey)">{{ cell.day }}</button>
            }
          }
        </div>
      </div>

      <div class="slots">
        @if (!selectedDate()) {
          <p class="slots__hint">Elige un día para ver los horarios disponibles.</p>
          <p class="slots__legend">Los días disponibles aparecen resaltados en el calendario.</p>
        } @else if (loading()) {
          <p class="slots__hint">Buscando horarios…</p>
        } @else if (slots().length === 0) {
          <p class="slots__hint">Ese día ya no tiene lugares. Elige otro.</p>
        } @else {
          <h3 class="slots__title">Horarios del {{ prettyDate() }}</h3>
          <div class="slots__grid">
            @for (slot of slots(); track slot) {
              <button type="button" class="slot"
                      [class.is-selected]="slot === selectedTime()"
                      [attr.aria-pressed]="slot === selectedTime()"
                      (click)="timeSelect.emit(slot)">
                <span class="slot__start">{{ slot }}</span>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './christmas-calendar.component.scss',
})
export class ChristmasCalendarComponent {
  readonly intervals = input<BusyInterval[]>([]);
  readonly currentMonth = input.required<number>();
  readonly currentYear = input.required<number>();
  readonly selectedDate = input<string>('');
  readonly selectedTime = input<string>('');
  readonly loading = input(false);

  /** Delta de mes: -1 o 1. La pagina decide como se mueve el cursor. */
  readonly monthChange = output<number>();
  readonly dateSelect = output<string>();
  readonly timeSelect = output<string>();

  protected readonly weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  protected readonly month = computed(() =>
    buildChristmasMonth(this.currentMonth(), this.currentYear(), this.intervals()),
  );

  protected readonly slots = computed(() => availableSlots(this.selectedDate(), this.intervals()));

  protected readonly prettyDate = computed(() => {
    const [, month, day] = (this.selectedDate() || '').split('-');
    if (!day) return '';
    const nombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${Number(day)} de ${nombres[Number(month) - 1]}`;
  });

  /**
   * Lo que oye quien navega con lector de pantalla.
   *
   * "Cerrado" y "sin lugares" no son lo mismo: un lunes el estudio no abre, y decirle
   * a la clienta que se agotaron los lugares seria mentirle.
   */
  protected dayLabel(cell: { day: number | null; closed: boolean; full: boolean }): string {
    if (cell.closed) return `${cell.day} — cerrado`;
    if (cell.full) return `${cell.day} — sin lugares`;
    return `Día ${cell.day}`;
  }
}
