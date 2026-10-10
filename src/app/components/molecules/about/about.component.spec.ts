import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [AboutComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should_present_dan_luna_as_a_photographer_in_queretaro', () => {
    const el = render();
    expect(el.querySelector('.about__role')?.textContent).toContain('Fotógrafa profesional');
    expect(el.querySelector('img')?.getAttribute('alt')).toBe('Dan Luna, fotógrafa profesional en Querétaro');
  });

  it('should_frame_the_portrait_for_the_reveal_and_parallax_effect', () => {
    const wrap = render().querySelector('.about__photo-wrap')!;
    expect(wrap.hasAttribute('dlparallax')).toBe(true);
  });

  it('should_keep_the_link_to_the_full_story', () => {
    expect(render().querySelector('a[href="/fotografa-en-queretaro"]')).not.toBeNull();
  });
});
