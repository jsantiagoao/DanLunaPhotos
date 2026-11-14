import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NavidadComponent } from './navidad.component';
import { BookingService } from '../agendar/booking.service';
import { SeoService } from '../../shared/seo/seo.service';
import { NavbarComponent } from '../../components/organisms/navbar/navbar.component';
import { DEFAULT_CAMPAIGN_CONFIG } from './christmas-slots';

/**
 * Incidencia: los errores del formulario salían hasta arriba de la página y la clienta
 * solo veía que "Reservar" no hacía nada. Ahora salen en un modal junto a ella; el
 * aviso de cambio de precio se queda arriba, como estaba.
 */
@Component({ selector: 'app-navbar', standalone: true, template: '' })
class NavbarStub {}

const CONFIG = { ...DEFAULT_CAMPAIGN_CONFIG, content: { packageId: 'pkg-navidad' } };

describe('NavidadComponent', () => {
  let booking: { getAvailability: jest.Mock; reserve: jest.Mock };

  beforeEach(() => {
    // jsdom no implementa scrollTo; la confirmación lo usa para subir al inicio.
    window.scrollTo = jest.fn() as any;
  });

  function render() {
    booking = {
      getAvailability: jest.fn().mockReturnValue(of({ intervals: [], campaign: null, config: CONFIG })),
      reserve: jest.fn().mockReturnValue(of({})),
    };
    TestBed.configureTestingModule({
      imports: [NavidadComponent],
      providers: [
        { provide: BookingService, useValue: booking },
        { provide: SeoService, useValue: { apply: jest.fn(), clearJsonLd: jest.fn() } },
      ],
    });
    TestBed.overrideComponent(NavidadComponent, {
      remove: { imports: [NavbarComponent] },
      add: { imports: [NavbarStub] },
    });
    const fixture = TestBed.createComponent(NavidadComponent);
    fixture.detectChanges();

    // Paso 2 con un formulario válido; cada prueba rompe lo que necesita.
    const page = fixture.componentInstance as any;
    Object.assign(page.form, {
      name: 'Ana Torres', email: 'ana@example.com', phone: '4421234567',
      date: '2026-12-06', time: '09:50', personas: 3,
    });
    page.step.set('datos');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const submit = () => {
      el.querySelector('form.form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };
    return { fixture, el, page, submit };
  }

  const dialog = (el: HTMLElement) => el.querySelector('[role="alertdialog"]');
  const topAlert = (el: HTMLElement) => el.querySelector('p.alert');

  it('should_show_a_form_error_in_a_modal_not_at_the_top', () => {
    const { el, page, submit } = render();
    page.form.phone = '+52 442 123 4567';
    submit();

    expect(dialog(el)!.textContent).toContain('El teléfono debe tener 10 dígitos');
    expect(topAlert(el)).toBeNull();
    expect(booking.reserve).not.toHaveBeenCalled();
  });

  it('should_focus_the_field_to_fix_when_the_modal_closes', async () => {
    const { fixture, el, page, submit } = render();
    page.form.phone = '442 123';
    submit();
    await fixture.whenStable();  // el modal ya tomó el foco, como en el navegador

    (el.querySelector('.error-dialog__button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialog(el)).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('#x-phone'));
  });

  it('should_show_a_server_error_in_the_modal', () => {
    const { el, submit } = render();
    booking.reserve.mockReturnValue(throwError(() => ({ status: 500, error: { message: 'Falla del servidor' } })));
    submit();

    expect(dialog(el)!.textContent).toContain('Falla del servidor');
    expect(topAlert(el)).toBeNull();
  });

  it('should_show_a_missing_package_in_the_modal', () => {
    const { fixture, el, page, submit } = render();
    page.config.set({ ...CONFIG, content: {} });
    fixture.detectChanges();
    submit();

    expect(dialog(el)!.textContent).toContain('no tiene un paquete configurado');
  });

  it('should_keep_the_price_change_notice_at_the_top', () => {
    const { fixture, el, page, submit } = render();
    page.campaign.set({ price: 1800 });
    fixture.detectChanges();
    booking.getAvailability.mockReturnValue(of({ intervals: [], campaign: { price: 2200 }, config: CONFIG }));
    submit();

    expect(topAlert(el)!.textContent).toContain('El precio de preventa se agotó');
    expect(dialog(el)).toBeNull();
  });

  /**
   * Incidencia: en el navegador de Instagram para Android, "Reservar" no hacía nada ni mostraba
   * errores. La única salida de `reservar()` sin ningún aviso era el campo trampa lleno: los
   * autocompletados de los navegadores integrados rellenan campos ocultos como si fueran de la
   * clienta. Una persona nunca debe quedarse sin respuesta.
   */
  it('should_answer_in_the_modal_when_the_hidden_trap_field_was_autofilled', () => {
    const { el, page, submit } = render();
    page.honeypot = 'https://autocompletado.example';
    submit();

    expect(dialog(el)).not.toBeNull();
    expect(booking.reserve).not.toHaveBeenCalled();
  });

  it('should_let_the_person_reserve_on_the_next_try_after_an_autofilled_trap_field', () => {
    const { el, page, submit } = render();
    page.honeypot = 'https://autocompletado.example';
    submit();
    expect(page.honeypot).toBe('');

    (el.querySelector('.error-dialog__button') as HTMLButtonElement).click();
    submit();

    expect(booking.reserve).toHaveBeenCalled();
    expect(page.step()).toBe('listo');
  });

  it('should_hide_the_trap_field_from_autofill_services', () => {
    const { el } = render();
    const trap = el.querySelector('input.honeypot') as HTMLInputElement;

    // "website" es un nombre que los autocompletados reconocen y rellenan.
    expect(trap.name).not.toMatch(/website|url|sitio|web/i);
    expect(trap.getAttribute('autocomplete')).toBe('off');
    expect(trap.getAttribute('data-lpignore')).toBe('true');
    expect(trap.getAttribute('data-1p-ignore')).not.toBeNull();
  });

  it('should_reserve_when_the_form_is_valid', () => {
    const { el, page, submit } = render();
    submit();

    expect(booking.reserve).toHaveBeenCalled();
    expect(page.step()).toBe('listo');
    expect(dialog(el)).toBeNull();
  });
});
