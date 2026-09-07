import { imageProfile, IMAGE_PROFILES } from './image-profiles';

describe('imageProfile', () => {
  it('should_return_widths_and_sizes_for_known_profile', () => {
    const p = imageProfile('card');
    expect(p.widths.length).toBeGreaterThan(0);
    expect(p.sizes).toContain('vw');
  });

  it('should_expose_hero_gallery_card_portrait_profiles', () => {
    expect(Object.keys(IMAGE_PROFILES).sort()).toEqual(
      ['card', 'gallery', 'hero', 'portrait']
    );
  });

  it('should_return_empty_profile_for_unknown_name', () => {
    // Sin perfil → el atomo cae a webp unico (retrocompatible).
    const p = imageProfile('no-existe' as any);
    expect(p.widths).toEqual([]);
    expect(p.sizes).toBe('');
  });

  it('hero_should_cover_full_viewport_widths', () => {
    expect(imageProfile('hero').sizes).toBe('100vw');
    expect(imageProfile('hero').widths).toContain(1600);
  });
});
