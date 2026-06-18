import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from './booking.service';
import { BusySlot, BookingRequest } from './booking.models';
import { BookingLogic } from './booking.logic';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SESSION_TYPES, FIELD_LABELS, FIELD_TYPES } from './session-types.config';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './agendar.component.html',
  styleUrl: './agendar.component.scss',
})
export class AgendarComponent {
  // State
  currentMonth = signal(new Date().getMonth() + 1);
  currentYear = signal(new Date().getFullYear());
  busySlots = signal<BusySlot[]>([]);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);
  step = signal<'calendar' | 'form' | 'success'>('calendar');
  loading = signal(false);
  error = signal<string | null>(null);

  // Form data
  form: BookingRequest = { name: '', email: '', phone: '', type: 'bautizo', date: '', time: '', location: '' };
  honeypot = ''; // Anti-bot
  formPackage = '';
  formDetails: Record<string, string> = {};
  sessionTypes = SESSION_TYPES;
  currentPackages: any[] = SESSION_TYPES[0].packages;
  currentFields: string[] = [];

  onTypeChange() {
    this.formPackage = '';
    this.formDetails = {};
    const t = SESSION_TYPES.find(st => st.id === this.form.type);
    this.currentPackages = t?.packages || [];
    this.currentFields = [];
  }

  onPackageChange() {
    this.formDetails = {};
    const t = SESSION_TYPES.find(st => st.id === this.form.type);
    const pkg = t?.packages.find(p => p.id === this.formPackage);
    this.currentFields = pkg?.fields || [];
  }

  getFieldLabel(key: string): string { return FIELD_LABELS[key] || key; }
  getFieldType(key: string): string { return FIELD_TYPES[key] || 'text'; }

  // Computed
  monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth() - 1);
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  });

  daysInMonth = computed(() => new Date(this.currentYear(), this.currentMonth(), 0).getDate());

  firstDayOfMonth = computed(() => {
    const day = new Date(this.currentYear(), this.currentMonth() - 1, 1).getDay();
    return day === 0 ? 6 : day - 1; // Lunes = 0
  });

  availableTimeSlots = computed(() => {
    return BookingLogic.getAvailableTimeSlots(this.selectedDate() || '', this.busySlots());
  });

  constructor(private bookingSvc: BookingService) {
    this.loadAvailability();
  }

  loadAvailability(): void {
    this.loading.set(true);
    this.bookingSvc.getAvailability(this.currentMonth(), this.currentYear()).subscribe({
      next: res => { this.busySlots.set(res.busySlots); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar disponibilidad'); this.loading.set(false); },
    });
  }

  prevMonth(): void {
    const now = new Date();
    if (this.currentMonth() === now.getMonth() + 1 && this.currentYear() === now.getFullYear()) return;
    if (this.currentMonth() === 1) { this.currentMonth.set(12); this.currentYear.set(this.currentYear() - 1); }
    else { this.currentMonth.set(this.currentMonth() - 1); }
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.loadAvailability();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) { this.currentMonth.set(1); this.currentYear.set(this.currentYear() + 1); }
    else { this.currentMonth.set(this.currentMonth() + 1); }
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.loadAvailability();
  }

  selectDate(day: number): void {
    if (!this.isDayAvailable(day)) return;
    const m = this.currentMonth().toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    this.selectedDate.set(`${this.currentYear()}-${m}-${d}`);
    this.selectedTime.set(null);
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  goToForm(): void {
    if (!this.selectedDate() || !this.selectedTime()) return;
    this.form.date = this.selectedDate()!;
    this.form.time = this.selectedTime()!;
    this.step.set('form');
  }

  isDayPast(day: number): boolean {
    return BookingLogic.isDayPast(day, this.currentMonth(), this.currentYear());
  }

  isDayAvailable(day: number): boolean {
    return BookingLogic.isDayAvailable(day, this.currentMonth(), this.currentYear());
  }

  isDayFullyBooked(day: number): boolean {
    return BookingLogic.isDayFullyBooked(day, this.currentMonth(), this.currentYear(), this.busySlots());
  }

  // Validation
  isFormValid(): boolean {
    return BookingLogic.isFormValid(this.form);
  }

  // Sanitize (OWASP - client side defense in depth)
  sanitize(value: string): string {
    return BookingLogic.sanitize(value);
  }

  submitBooking(): void {
    if (!this.isFormValid() || this.loading() || this.honeypot) return;

    const payload: any = {
      name: this.sanitize(this.form.name.trim()),
      email: this.form.email.trim().toLowerCase(),
      phone: this.form.phone.replace(/\s/g, ''),
      type: this.form.type,
      date: this.form.date,
      time: this.form.time,
      location: this.form.location ? this.sanitize(this.form.location.trim()) : undefined,
      package: this.formPackage,
      details: this.formDetails,
    };

    this.loading.set(true);
    this.error.set(null);

    this.bookingSvc.reserve(payload).subscribe({
      next: () => { this.step.set('success'); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al reservar. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  formatPhone(value: string): string {
    return BookingLogic.formatPhone(value);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.phone = this.formatPhone(input.value);
    input.value = this.form.phone;
  }
}
