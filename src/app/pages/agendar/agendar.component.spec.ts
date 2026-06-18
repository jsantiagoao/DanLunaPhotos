import { AgendarComponent } from './agendar.component';
import { of, throwError } from 'rxjs';

describe('AgendarComponent (unit)', () => {
  let component: AgendarComponent;
  let mockBookingSvc: any;

  beforeEach(() => {
    mockBookingSvc = {
      getAvailability: jest.fn().mockReturnValue(of({ month: 7, year: 2026, busySlots: [] })),
      reserve: jest.fn(),
    };
    component = new AgendarComponent(mockBookingSvc);
  });

  it('should create and load availability', () => {
    expect(component).toBeTruthy();
    expect(mockBookingSvc.getAvailability).toHaveBeenCalled();
  });

  it('should not allow past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    component.currentMonth.set(yesterday.getMonth() + 1);
    component.currentYear.set(yesterday.getFullYear());
    expect(component.isDayPast(yesterday.getDate())).toBe(true);
  });

  it('should not allow Sundays', () => {
    const date = new Date();
    while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
    component.currentMonth.set(date.getMonth() + 1);
    component.currentYear.set(date.getFullYear());
    expect(component.isDayAvailable(date.getDate())).toBe(false);
  });

  it('should validate form - invalid email', () => {
    component.form = { name: 'María García', email: 'bad', phone: '4421234567', type: 'bautizo', date: '2026-08-15', time: '10:00' };
    expect(component.isFormValid()).toBe(false);
  });

  it('should validate form - invalid phone', () => {
    component.form = { name: 'María García', email: 'a@b.com', phone: '123', type: 'bautizo', date: '2026-08-15', time: '10:00' };
    expect(component.isFormValid()).toBe(false);
  });

  it('should validate form - short name', () => {
    component.form = { name: 'AB', email: 'a@b.com', phone: '4421234567', type: 'bautizo', date: '2026-08-15', time: '10:00' };
    expect(component.isFormValid()).toBe(false);
  });

  it('should validate form - valid data', () => {
    component.form = { name: 'María García', email: 'a@b.com', phone: '4421234567', type: 'bautizo', date: '2026-08-15', time: '10:00' };
    expect(component.isFormValid()).toBe(true);
  });

  it('should sanitize HTML/JS injection', () => {
    expect(component.sanitize('<script>alert("xss")</script>Hello')).toBe('Hello');
    expect(component.sanitize('<img onerror=alert(1) src=x>')).toBe('');
    expect(component.sanitize('Normal text')).toBe('Normal text');
  });

  it('should format phone correctly', () => {
    expect(component.formatPhone('4421234567')).toBe('442 123 4567');
    expect(component.formatPhone('442')).toBe('442');
    expect(component.formatPhone('442123')).toBe('442 123');
    expect(component.formatPhone('44212345678999')).toBe('442 123 4567'); // Trunca a 10
  });

  it('should handle booking error', () => {
    component.form = { name: 'María García', email: 'a@b.com', phone: '4421234567', type: 'bautizo', date: '2026-08-15', time: '10:00' };
    component.step.set('form');
    mockBookingSvc.reserve.mockReturnValue(throwError(() => ({ error: { message: 'Slot no disponible' } })));

    component.submitBooking();

    expect(component.error()).toBe('Slot no disponible');
    expect(component.step()).toBe('form');
  });

  it('should navigate to success on booking', () => {
    component.form = { name: 'María García', email: 'a@b.com', phone: '4421234567', type: 'bautizo', date: '2026-08-15', time: '10:00' };
    component.step.set('form');
    mockBookingSvc.reserve.mockReturnValue(of({ message: 'ok', sessionId: '1', date: '2026-08-15', time: '10:00' }));

    component.submitBooking();

    expect(component.step()).toBe('success');
    expect(component.loading()).toBe(false);
  });

  it('should not submit if form is invalid', () => {
    component.form = { name: '', email: '', phone: '', type: '', date: '', time: '' };
    component.submitBooking();
    expect(mockBookingSvc.reserve).not.toHaveBeenCalled();
  });

  it('should not submit if already loading', () => {
    component.form = { name: 'María García', email: 'a@b.com', phone: '4421234567', type: 'bautizo', date: '2026-08-15', time: '10:00' };
    component.loading.set(true);
    component.submitBooking();
    expect(mockBookingSvc.reserve).not.toHaveBeenCalled();
  });

  it('should filter available time slots correctly', () => {
    component.busySlots.set([{ date: '2026-07-15', time: '10:00' }, { date: '2026-07-15', time: '15:00' }]);
    component.selectedDate.set('2026-07-15');
    const slots = component.availableTimeSlots();
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('15:00');
    expect(slots).toContain('09:00');
    expect(slots).toContain('11:00');
  });

  it('should detect fully booked day', () => {
    const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00'];
    component.busySlots.set(allSlots.map(t => ({ date: '2026-07-15', time: t })));
    component.currentMonth.set(7);
    component.currentYear.set(2026);
    expect(component.isDayFullyBooked(15)).toBe(true);
  });
});
