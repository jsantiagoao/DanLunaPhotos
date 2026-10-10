import { headerState, parallaxOffset } from './scroll-math';

describe('scroll-math', () => {
  describe('headerState', () => {
    it('should_stay_plain_at_the_top_of_the_page', () => {
      expect(headerState(0, 10, false)).toEqual({ scrolled: false, hidden: false });
    });

    it('should_become_compact_once_the_page_scrolls', () => {
      expect(headerState(60, 120, false).scrolled).toBe(true);
    });

    it('should_hide_when_scrolling_down_past_the_hero', () => {
      expect(headerState(700, 760, false).hidden).toBe(true);
    });

    it('should_reappear_when_scrolling_up', () => {
      expect(headerState(900, 860, false).hidden).toBe(false);
    });

    it('should_ignore_tiny_scroll_jitter', () => {
      // 4px de rebote no deben mostrar/ocultar el header.
      expect(headerState(900, 896, false, true).hidden).toBe(true);
    });

    it('should_never_hide_while_the_mobile_menu_is_open', () => {
      expect(headerState(700, 800, true).hidden).toBe(false);
    });
  });

  describe('parallaxOffset', () => {
    it('should_be_0_when_the_element_is_centered_in_the_viewport', () => {
      expect(parallaxOffset(300, 400, 1000, 0.2)).toBeCloseTo(0);
    });

    it('should_move_against_the_scroll_proportionally_to_the_strength', () => {
      expect(parallaxOffset(600, 400, 1000, 0.2)).toBeCloseTo(-60);
      expect(parallaxOffset(0, 400, 1000, 0.2)).toBeCloseTo(60);
    });
  });
});
