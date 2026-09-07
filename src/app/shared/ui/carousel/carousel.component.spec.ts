import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarouselComponent } from './carousel.component';

/**
 * CarouselComponent: organism reutilizable de slider con autoplay + dots.
 * Reemplaza la logica duplicada de slider en bautizos/bodas (DRY).
 * Estas pruebas fijan su contrato: render de slides, slide activo, dots,
 * navegacion y limpieza del intervalo.
 */
describe('CarouselComponent', () => {
  let fixture: ComponentFixture<CarouselComponent>;
  let component: CarouselComponent;

  const IMAGES = ['a/1.jpg', 'a/2.jpg', 'a/3.jpg'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
  });

  function render(images = IMAGES, alt = 'Foto') {
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('alt', alt);
    fixture.detectChanges();
  }

  it('should_render_one_slide_per_image', () => {
    render();
    const slides = fixture.nativeElement.querySelectorAll('.carousel__slide');
    expect(slides.length).toBe(3);
  });

  it('should_render_an_app_image_per_slide', () => {
    render();
    const imgs = fixture.nativeElement.querySelectorAll('app-image');
    expect(imgs.length).toBe(3);
  });

  it('should_mark_first_slide_active_initially', () => {
    render();
    const active = fixture.nativeElement.querySelectorAll('.carousel__slide--active');
    expect(active.length).toBe(1);
    expect(component.current()).toBe(0);
  });

  it('should_render_one_dot_per_image', () => {
    render();
    const dots = fixture.nativeElement.querySelectorAll('.carousel__dot');
    expect(dots.length).toBe(3);
  });

  it('should_change_active_slide_on_goTo', () => {
    render();
    component.goTo(2);
    fixture.detectChanges();
    expect(component.current()).toBe(2);
  });

  it('should_advance_with_next_and_wrap', () => {
    render();
    component.next();
    expect(component.current()).toBe(1);
    component.goTo(2);
    component.next();
    expect(component.current()).toBe(0); // wrap
  });

  it('should_clear_interval_on_destroy', () => {
    jest.spyOn(window, 'clearInterval');
    render();
    fixture.destroy();
    expect(window.clearInterval).toHaveBeenCalled();
  });

  it('should_expose_alt_with_index_for_accessibility', () => {
    render(IMAGES, 'Boda');
    // El alt de cada imagen combina el alt base + posicion.
    expect(component.altFor(0)).toBe('Boda 1');
    expect(component.altFor(2)).toBe('Boda 3');
  });
});
