import { TestBed } from '@angular/core/testing';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [HeroComponent] });
    const fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should_include_the_local_keyword_in_the_h1', () => {
    // SEO: el H1 solo decía "Cada momento, un recuerdo.", sin servicio ni ciudad.
    const h1 = render().querySelector('h1')!;
    expect(h1.textContent).toContain('Fotógrafa profesional en Querétaro');
    expect(h1.textContent).toContain('Cada momento,');
  });

  it('should_serve_a_smaller_photo_to_small_screens', () => {
    // En móvil se descargaba la foto de 1920px (298 KB) aunque existe una de 800px (77 KB).
    const source = render().querySelector('.hero__media source')!;
    expect(source.getAttribute('srcset')).toContain('hero-bg-800.webp 800w');
    expect(source.getAttribute('sizes')).toBe('100vw');
  });

  it('should_make_the_booking_button_the_primary_action', () => {
    expect(render().querySelector('.hero__cta')!.classList).toContain('hero__cta--primary');
  });

  it('should_split_the_headline_in_lines_for_the_entrance_animation', () => {
    const lines = Array.from(render().querySelectorAll('.hero__line')).map((l) => l.textContent?.trim());
    expect(lines).toEqual(['Cada momento,', 'un recuerdo.']);
  });

  it('should_make_the_booking_button_magnetic_and_shiny', () => {
    const cta = render().querySelector('.hero__cta')!;
    expect(cta.classList).toContain('dl-magnetic');
    expect(cta.classList).toContain('dl-shine');
  });
});
