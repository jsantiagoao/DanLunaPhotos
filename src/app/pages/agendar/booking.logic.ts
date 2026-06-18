import { BusySlot, BookingRequest } from './booking.models';

/**
 * Pure logic class for booking - testable without Angular framework.
 * Follows SRP: only validation and computation, no UI or HTTP.
 */
export class BookingLogic {

  static isDayPast(day: number, month: number, year: number): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(year, month - 1, day) < today;
  }

  static isDayAvailable(day: number, month: number, year: number): boolean {
    return !BookingLogic.isDayPast(day, month, year);
  }

  static isDayFullyBooked(day: number, month: number, year: number, busySlots: BusySlot[]): boolean {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    // Día completo bloqueado
    if (busySlots.some(s => s.date === dateStr && s.time === null)) return true;
    // Todos los slots ocupados
    const allSlots = BookingLogic.getTimeSlots();
    const busy = busySlots.filter(s => s.date === dateStr && s.time !== null);
    return busy.length >= allSlots.length;
  }

  static getAvailableTimeSlots(selectedDate: string, busySlots: BusySlot[]): string[] {
    // Si el día está bloqueado completo, no hay slots
    if (busySlots.some(s => s.date === selectedDate && s.time === null)) return [];
    const allSlots = BookingLogic.getTimeSlots();
    const busy = busySlots.filter(s => s.date === selectedDate && s.time !== null).map(s => s.time!);
    return allSlots.filter(t => !busy.includes(t));
  }

  static getTimeSlots(): string[] {
    return ['09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00'];
  }

  static isFormValid(form: BookingRequest): boolean {
    return (
      form.name.trim().length >= 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      /^\d{10}$/.test(form.phone.replace(/\s/g, '')) &&
      !!form.type &&
      !!form.date &&
      !!form.time
    );
  }

  static sanitize(value: string): string {
    return value.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '');
  }

  static formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
}
