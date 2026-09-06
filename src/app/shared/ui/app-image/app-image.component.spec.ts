import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppImageComponent } from './app-image.component';
import { toWebp } from './to-webp';

/**
 * AppImage es el atomo unico para servir imagenes con <picture>: webp con
 * fallback al raster original. Centraliza la regla (DRY) y el lazy-loading por
 * defecto. Estas pruebas fijan su contrato antes de la implementacion (RED).
 */
describe('toWebp (funcion pura)', () => {
  it('should_derive_webp_from_jpg', () => {
    expect(toWebp('assets/images/gallery/boda.jpg')).toBe('assets/images/gallery/boda.webp');
  });

  it('should_derive_webp_from_jpeg', () => {
    expect(toWebp('a/foto.jpeg')).toBe('a/foto.webp');
  });

  it('should_derive_webp_from_png', () => {
    expect(toWebp('a/img.png')).toBe('a/img.webp');
  });

  it('should_be_case_insensitive', () => {
    expect(toWebp('a/FOTO.JPG')).toBe('a/FOTO.webp');
  });

  it('should_preserve_querystring', () => {
    expect(toWebp('a/foto.jpg?v=2')).toBe('a/foto.webp?v=2');
  });

  it('should_return_unchanged_when_not_raster', () => {
    expect(toWebp('a/icon.svg')).toBe('a/icon.svg');
    expect(toWebp('')).toBe('');
  });
});

describe('AppImageComponent', () => {
  let fixture: ComponentFixture<AppImageComponent>;
  let component: AppImageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppImageComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppImageComponent);
    component = fixture.componentInstance;
  });

  function render(src: string, alt = 'foto', lazy = true) {
    fixture.componentRef.setInput('src', src);
    fixture.componentRef.setInput('alt', alt);
    fixture.componentRef.setInput('lazy', lazy);
    fixture.detectChanges();
  }

  it('should_render_picture_with_webp_source_and_jpg_fallback', () => {
    render('assets/images/gallery/boda.jpg', 'Boda');
    const el: HTMLElement = fixture.nativeElement;
    const source = el.querySelector('source');
    const img = el.querySelector('img');

    expect(source?.getAttribute('type')).toBe('image/webp');
    expect(source?.getAttribute('srcset')).toBe('assets/images/gallery/boda.webp');
    expect(img?.getAttribute('src')).toBe('assets/images/gallery/boda.jpg');
  });

  it('should_require_alt_for_accessibility', () => {
    render('a/foto.jpg', 'Retrato familiar');
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Retrato familiar');
  });

  it('should_default_to_lazy_loading', () => {
    render('a/foto.jpg', 'x', true);
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('should_allow_eager_loading_for_above_the_fold', () => {
    render('a/foto.jpg', 'x', false);
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
  });

  it('should_fallback_to_jpg_when_webp_source_fails', () => {
    render('a/foto.jpg', 'x');
    // Simula que el navegador no pudo pintar la imagen (webp 404 y sin caer solo).
    component.onError();
    fixture.detectChanges();
    const source = fixture.nativeElement.querySelector('source');
    // El <source> webp se retira → el navegador usa el <img src=jpg>.
    expect(source).toBeNull();
  });
});
