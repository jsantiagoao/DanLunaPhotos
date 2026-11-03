import { GallerySlideshow, SLIDESHOW_INTERVAL_MS } from './gallery-slideshow';

describe('GallerySlideshow', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should_advance_on_its_own_at_a_steady_pace', () => {
    const show = new GallerySlideshow<string>();
    show.start(['a', 'b', 'c']);
    expect(show.current).toBe('a');
    jest.advanceTimersByTime(SLIDESHOW_INTERVAL_MS);
    expect(show.current).toBe('b');
    show.stop();
  });

  it('should_not_speed_up_when_reopened', () => {
    const show = new GallerySlideshow<string>();
    show.start(['a', 'b', 'c', 'd']);
    show.stop();
    show.start(['a', 'b', 'c', 'd']);
    jest.advanceTimersByTime(SLIDESHOW_INTERVAL_MS);
    expect(show.current).toBe('b');
    show.stop();
  });

  it('should_stop_advancing_when_closed', () => {
    const show = new GallerySlideshow<string>();
    show.start(['a', 'b']);
    show.stop();
    jest.advanceTimersByTime(SLIDESHOW_INTERVAL_MS * 3);
    expect(show.current).toBe('a');
    expect(show.active).toBe(false);
  });

  it('should_wrap_around_in_both_directions', () => {
    const show = new GallerySlideshow<string>();
    show.start(['a', 'b']);
    show.prev();
    expect(show.current).toBe('b');
    show.next();
    expect(show.current).toBe('a');
    show.stop();
  });

  it('should_not_start_without_photos', () => {
    const show = new GallerySlideshow<string>();
    show.start([]);
    expect(show.active).toBe(false);
    show.next();
    expect(show.current).toBeUndefined();
  });
});
