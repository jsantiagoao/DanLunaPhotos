import { nextIndex, prevIndex } from './carousel.logic';

describe('carousel.logic', () => {
  describe('nextIndex', () => {
    it('should_advance_to_next', () => {
      expect(nextIndex(0, 3)).toBe(1);
      expect(nextIndex(1, 3)).toBe(2);
    });

    it('should_wrap_to_zero_at_end', () => {
      expect(nextIndex(2, 3)).toBe(0);
    });

    it('should_stay_at_zero_for_single_or_empty', () => {
      expect(nextIndex(0, 1)).toBe(0);
      expect(nextIndex(0, 0)).toBe(0);
    });
  });

  describe('prevIndex', () => {
    it('should_go_to_previous', () => {
      expect(prevIndex(2, 3)).toBe(1);
    });

    it('should_wrap_to_last_at_start', () => {
      expect(prevIndex(0, 3)).toBe(2);
    });

    it('should_stay_at_zero_for_single_or_empty', () => {
      expect(prevIndex(0, 1)).toBe(0);
      expect(prevIndex(0, 0)).toBe(0);
    });
  });
});
