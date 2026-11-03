import { TestBed } from '@angular/core/testing';
import { GalleryIconComponent } from './gallery-icon.component';

describe('GalleryIconComponent', () => {
  function render(name: string, size?: number) {
    const fixture = TestBed.createComponent(GalleryIconComponent);
    fixture.componentRef.setInput('name', name);
    if (size) fixture.componentRef.setInput('size', size);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('svg') as SVGElement;
  }

  it('should_draw_the_requested_icon', () => {
    expect(render('heart').querySelector('path')?.getAttribute('d')).toContain('20.84');
  });

  it('should_stay_hidden_from_screen_readers_because_the_button_names_it', () => {
    expect(render('play').getAttribute('aria-hidden')).toBe('true');
  });

  it('should_accept_a_custom_size', () => {
    expect(render('close', 24).getAttribute('width')).toBe('24');
  });
});
