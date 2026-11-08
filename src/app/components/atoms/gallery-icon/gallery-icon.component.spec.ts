import { TestBed } from '@angular/core/testing';
import { GalleryIconComponent } from './gallery-icon.component';

describe('GalleryIconComponent', () => {
  function render(name: string, size?: number, filled?: boolean) {
    const fixture = TestBed.createComponent(GalleryIconComponent);
    fixture.componentRef.setInput('name', name);
    if (size) fixture.componentRef.setInput('size', size);
    if (filled !== undefined) fixture.componentRef.setInput('filled', filled);
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

  // El relleno lo decide el átomo: un estilo del padre no alcanza este svg (encapsulado de Angular).
  it('should_draw_only_the_outline_by_default', () => {
    expect(render('heart').getAttribute('fill')).toBe('none');
  });

  it('should_fill_with_the_current_color_when_asked', () => {
    expect(render('heart', undefined, true).getAttribute('fill')).toBe('currentColor');
  });
});
