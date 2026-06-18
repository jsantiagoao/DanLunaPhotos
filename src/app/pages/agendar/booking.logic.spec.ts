import { BookingLogic } from './booking.logic';

describe('BookingLogic', () => {

  describe('isDayPast', () => {
    it('should detect past dates', () => {
      expect(BookingLogic.isDayPast(1, 1, 2020)).toBe(true);
    });

    it('should allow future dates', () => {
      expect(BookingLogic.isDayPast(1, 1, 2030)).toBe(false);
    });
  });

  describe('isDayAvailable', () => {
    it('should not allow past dates', () => {
      expect(BookingLogic.isDayAvailable(1, 1, 2020, )).toBe(false);
    });

    it('should not allow Sundays', () => {
      // Domingos YA están permitidos
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
      expect(BookingLogic.isDayAvailable(date.getDate(), date.getMonth() + 1, date.getFullYear())).toBe(true);
    });

    it('should allow weekdays in the future', () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      while (date.getDay() === 0) date.setDate(date.getDate() + 1);
      expect(BookingLogic.isDayAvailable(date.getDate(), date.getMonth() + 1, date.getFullYear())).toBe(true);
    });
  });

  describe('isDayFullyBooked', () => {
    it('should detect fully booked day', () => {
      const allSlots = BookingLogic.getTimeSlots();
      const busy = allSlots.map(t => ({ date: '2030-07-15', time: t, type: 'session' as const }));
      expect(BookingLogic.isDayFullyBooked(15, 7, 2030, busy)).toBe(true);
    });

    it('should not flag partially booked day', () => {
      const busy = [{ date: '2030-07-15', time: '10:00', type: 'session' as const }];
      expect(BookingLogic.isDayFullyBooked(15, 7, 2030, busy)).toBe(false);
    });

    it('should detect day blocked entirely (time=null)', () => {
      const busy = [{ date: '2030-07-15', time: null, type: 'blocked' as const }];
      expect(BookingLogic.isDayFullyBooked(15, 7, 2030, busy)).toBe(true);
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should filter out busy slots', () => {
      const busy = [
        { date: '2030-07-15', time: '10:00', type: 'session' as const },
        { date: '2030-07-15', time: '15:00', type: 'blocked' as const },
      ];
      const available = BookingLogic.getAvailableTimeSlots('2030-07-15', busy);
      expect(available).not.toContain('10:00');
      expect(available).not.toContain('15:00');
      expect(available).toContain('09:00');
      expect(available).toContain('11:00');
    });

    it('should return all slots if none busy', () => {
      const available = BookingLogic.getAvailableTimeSlots('2030-07-15', []);
      expect(available.length).toBe(8);
    });

    it('should return no slots if day is fully blocked', () => {
      const busy = [{ date: '2030-07-15', time: null, type: 'blocked' as const }];
      const available = BookingLogic.getAvailableTimeSlots('2030-07-15', busy);
      expect(available.length).toBe(0);
    });
  });

  describe('isFormValid', () => {
    const valid = { name: 'María García', email: 'a@b.com', phone: '4421234567', type: 'bautizo', date: '2026-08-15', time: '10:00' };

    it('should pass with valid data', () => {
      expect(BookingLogic.isFormValid(valid)).toBe(true);
    });

    it('should fail with invalid email', () => {
      expect(BookingLogic.isFormValid({ ...valid, email: 'bad' })).toBe(false);
    });

    it('should fail with short name', () => {
      expect(BookingLogic.isFormValid({ ...valid, name: 'AB' })).toBe(false);
    });

    it('should fail with invalid phone', () => {
      expect(BookingLogic.isFormValid({ ...valid, phone: '123' })).toBe(false);
    });

    it('should fail with empty type', () => {
      expect(BookingLogic.isFormValid({ ...valid, type: '' })).toBe(false);
    });

    it('should fail with empty date', () => {
      expect(BookingLogic.isFormValid({ ...valid, date: '' })).toBe(false);
    });

    it('should accept phone with spaces (strips them)', () => {
      expect(BookingLogic.isFormValid({ ...valid, phone: '442 123 4567' })).toBe(true);
    });
  });

  describe('sanitize', () => {
    it('should strip HTML tags and dangerous chars', () => {
      expect(BookingLogic.sanitize('<script>alert("xss")</script>Hello')).toBe('alert(xss)Hello');
    });

    it('should strip img tags with onerror', () => {
      expect(BookingLogic.sanitize('<img onerror=alert(1) src=x>')).toBe('');
    });

    it('should keep normal text', () => {
      expect(BookingLogic.sanitize('Normal text 123')).toBe('Normal text 123');
    });

    it('should strip special chars used in injection', () => {
      expect(BookingLogic.sanitize('hello<world>')).toBe('hello');
    });
  });

  describe('formatPhone', () => {
    it('should format 10 digits as XXX XXX XXXX', () => {
      expect(BookingLogic.formatPhone('4421234567')).toBe('442 123 4567');
    });

    it('should handle partial input', () => {
      expect(BookingLogic.formatPhone('442')).toBe('442');
      expect(BookingLogic.formatPhone('442123')).toBe('442 123');
    });

    it('should truncate to 10 digits', () => {
      expect(BookingLogic.formatPhone('44212345679999')).toBe('442 123 4567');
    });

    it('should strip non-digits', () => {
      expect(BookingLogic.formatPhone('442-123-4567')).toBe('442 123 4567');
    });
  });
});
