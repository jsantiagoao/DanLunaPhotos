import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calendar-picker.component.html',
  styleUrl: './calendar-picker.component.scss'
})
export class CalendarPickerComponent implements OnInit {
  currentDate = signal(new Date(2026, 2, 1)); // Marzo 2026
  selectedDate = signal<Date | null>(null);
  calendarDays = signal<CalendarDay[]>([]);
  
  readonly monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  readonly dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

  // Mock de días disponibles (en un caso real, vendrían de un API)
  readonly availableDays = [5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 28, 29, 30];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    // Obtener primer día del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Añadir días del mes anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false
      });
    }

    // Añadir días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isAvailable = this.availableDays.includes(i);
      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isAvailable,
        isSelected: this.selectedDate() ? this.isSameDay(date, this.selectedDate()!) : false
      });
    }

    // Añadir días del próximo mes
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false
      });
    }

    this.calendarDays.set(days);
  }

  selectDay(day: CalendarDay) {
    if (!day.isCurrentMonth || !day.isAvailable) return;

    this.selectedDate.set(day.date);
    this.generateCalendar();
  }

  previousMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    this.generateCalendar();
  }

  nextMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    this.generateCalendar();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getFormattedDate(): string {
    if (!this.selectedDate()) return '';
    const date = this.selectedDate()!;
    return `${date.getDate()} de ${this.monthNames[date.getMonth()]} de ${date.getFullYear()}`;
  }

  continueToPixieset() {
    if (!this.selectedDate()) {
      alert('Por favor selecciona una fecha');
      return;
    }
    // Redirigir a Pixieset con la fecha seleccionada
    // En un caso real, pasarías la fecha al sistema de reservas
    window.open('https://danlunaphotos.pixieset.com/booking/christmas-dreams-mini-sesiones-navide-as', '_blank');
  }

  getWeekRows() {
    const weeks = [];
    const days = this.calendarDays();
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }
}
