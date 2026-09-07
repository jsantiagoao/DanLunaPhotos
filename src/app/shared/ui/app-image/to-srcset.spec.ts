import { toWebpSrcset } from './to-srcset';

describe('toWebpSrcset', () => {
  it('should_build_srcset_with_width_descriptors_for_each_variant', () => {
    const out = toWebpSrcset('assets/images/gallery/boda.jpg', [400, 800, 1600]);
    expect(out).toBe(
      'assets/images/gallery/boda-400.webp 400w, ' +
      'assets/images/gallery/boda-800.webp 800w, ' +
      'assets/images/gallery/boda-1600.webp 1600w'
    );
  });

  it('should_handle_jpeg_and_png_extensions', () => {
    expect(toWebpSrcset('a/foto.jpeg', [400])).toBe('a/foto-400.webp 400w');
    expect(toWebpSrcset('a/foto.PNG', [800])).toBe('a/foto-800.webp 800w');
  });

  it('should_return_empty_string_for_non_raster', () => {
    expect(toWebpSrcset('a/icon.svg', [400, 800])).toBe('');
  });

  it('should_return_empty_string_when_no_widths', () => {
    expect(toWebpSrcset('a/foto.jpg', [])).toBe('');
  });

  it('should_return_empty_string_for_empty_src', () => {
    expect(toWebpSrcset('', [400])).toBe('');
  });

  it('should_sort_widths_ascending', () => {
    const out = toWebpSrcset('a/foto.jpg', [1600, 400, 800]);
    expect(out).toBe('a/foto-400.webp 400w, a/foto-800.webp 800w, a/foto-1600.webp 1600w');
  });
});
