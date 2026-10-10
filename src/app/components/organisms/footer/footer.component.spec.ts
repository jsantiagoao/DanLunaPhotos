import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';
import { FACEBOOK_URL } from '../../../shared/contact-info';

describe('FooterComponent', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [FooterComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should_link_to_the_service_pages_and_the_blog', () => {
    // Enlaces internos: el blog y "fotógrafa en Querétaro" no se enlazaban desde la home.
    const hrefs = Array.from(render().querySelectorAll<HTMLAnchorElement>('.footer__nav a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining([
      '/fotografia-bodas-queretaro', '/fotografia-bautizo-queretaro', '/sesiones-navidad', '/fotografa-en-queretaro', '/blog',
    ]));
  });

  it('should_show_tappable_phone_and_email', () => {
    const hrefs = Array.from(render().querySelectorAll<HTMLAnchorElement>('.footer__contact a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('tel:+524424906891');
    expect(hrefs).toContain('mailto:hola@danlunaphoto.com');
  });

  it('should_use_the_facebook_url_without_tracking_parameters', () => {
    const fb = render().querySelector<HTMLAnchorElement>('a[aria-label="Facebook"]')!;
    expect(fb.getAttribute('href')).toBe(FACEBOOK_URL);
  });

  it('should_give_the_logo_explicit_dimensions', () => {
    const logo = render().querySelector('.footer__logo img')!;
    expect(logo.getAttribute('width')).toBe('422');
    expect(logo.getAttribute('height')).toBe('150');
  });
});
