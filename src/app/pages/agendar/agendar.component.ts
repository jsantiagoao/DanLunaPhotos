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
  step = signal<'type' | 'package' | 'calendar' | 'slots' | 'form' | 'success'>('type');
  currentMonth = signal(new Date().getMonth() + 1);
  currentYear = signal(new Date().getFullYear());
  busySlots = signal<BusySlot[]>([]);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);
  selectedTime2 = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Selection
  selectedType = '';
  selectedPackageId = '';
  needsSecondSlot = false;
  sessionTypes = SESSION_TYPES;
  currentPackages: any[] = [];
  currentFields: string[] = [];

  // Form
  form: BookingRequest = { name: '', email: '', phone: '', type: '', date: '', time: '' };
  formDetails: Record<string, string> = {};
  honeypot = '';

  // Computed
  monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth() - 1);
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  });

  daysInMonth = computed(() => new Date(this.currentYear(), this.currentMonth(), 0).getDate());

  firstDayOfMonth = computed(() => {
    const day = new Date(this.currentYear(), this.currentMonth() - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  });

  availableTimeSlots = computed(() => {
    return BookingLogic.getAvailableTimeSlots(this.selectedDate() || '', this.busySlots());
  });

  availableSecondSlots = computed(() => {
    const all = BookingLogic.getAvailableTimeSlots(this.selectedDate() || '', this.busySlots());
    return all.filter(t => t !== this.selectedTime());
  });

  constructor(private bookingSvc: BookingService) {}

  // Step 1: Type
  selectType(typeId: string) {
    this.selectedType = typeId;
    const t = SESSION_TYPES.find(st => st.id === typeId);
    this.currentPackages = t?.packages || [];
    this.step.set('package');
  }

  // Step 2: Package
  selectPackage(pkgId: string) {
    this.selectedPackageId = pkgId;
    const t = SESSION_TYPES.find(st => st.id === this.selectedType);
    const pkg = t?.packages.find(p => p.id === pkgId);
    this.currentFields = pkg?.fields || [];
    this.needsSecondSlot = this.currentFields.some(f => f.startsWith('horaFiesta') || f.startsWith('horaEvento'));
    this.step.set('calendar');
    this.loadAvailability();
  }

  // Step 3: Calendar
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
    this.loadAvailability();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) { this.currentMonth.set(1); this.currentYear.set(this.currentYear() + 1); }
    else { this.currentMonth.set(this.currentMonth() + 1); }
    this.selectedDate.set(null);
    this.loadAvailability();
  }

  selectDate(day: number): void {
    if (!this.isDayAvailable(day)) return;
    this.selectedDate.set(this.buildDateStr(day));
    this.selectedTime.set(null);
    this.selectedTime2.set(null);
    this.step.set('slots');
  }

  buildDateStr(day: number): string {
    const m = this.currentMonth().toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${this.currentYear()}-${m}-${d}`;
  }

  isDayPast(day: number): boolean { return BookingLogic.isDayPast(day, this.currentMonth(), this.currentYear()); }
  isDayAvailable(day: number): boolean { return BookingLogic.isDayAvailable(day, this.currentMonth(), this.currentYear()); }
  isDayFullyBooked(day: number): boolean { return BookingLogic.isDayFullyBooked(day, this.currentMonth(), this.currentYear(), this.busySlots()); }

  // Step 4: Slots → Form
  goToForm(): void {
    this.form.type = this.selectedType;
    this.form.date = this.selectedDate()!;
    this.form.time = this.selectedTime()!;
    // Pre-fill time fields in details
    if (this.needsSecondSlot) {
      const ceremoniaField = this.currentFields.find(f => f === 'horaCeremonia');
      const fiestaField = this.currentFields.find(f => f.startsWith('horaFiesta') || f.startsWith('horaEvento'));
      if (ceremoniaField) this.formDetails[ceremoniaField] = this.selectedTime()!;
      if (fiestaField) this.formDetails[fiestaField] = this.selectedTime2()!;
    }
    this.step.set('form');
  }

  // Helpers
  getTypeLabel(): string { return SESSION_TYPES.find(t => t.id === this.selectedType)?.label || ''; }
  getPackageName(): string {
    const t = SESSION_TYPES.find(st => st.id === this.selectedType);
    return t?.packages.find(p => p.id === this.selectedPackageId)?.name || '';
  }
  getFieldLabel(key: string): string { return FIELD_LABELS[key] || key; }
  getFieldType(key: string): string { return FIELD_TYPES[key] || 'text'; }

  nonTimeFields(): string[] {
    return this.currentFields.filter(f => !f.startsWith('hora'));
  }

  // Validation
  isFormValid(): boolean {
    return (
      this.form.name.trim().length >= 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email) &&
      /^\d{10}$/.test(this.form.phone.replace(/\s/g, ''))
    );
  }

  sanitize(value: string): string { return BookingLogic.sanitize(value); }
  formatPhone(value: string): string { return BookingLogic.formatPhone(value); }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.phone = this.formatPhone(input.value);
    input.value = this.form.phone;
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
      package: this.selectedPackageId,
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
}
