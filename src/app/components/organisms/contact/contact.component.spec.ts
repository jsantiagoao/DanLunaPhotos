import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ContactComponent } from './contact.component';
import { WHATSAPP_DISPLAY, INSTAGRAM_HANDLE } from '../../../shared/contact-info';

/**
 * El callback de error hacia lo mismo que el de exito: marcaba el formulario como
 * enviado y lo limpiaba. Con la API caida el cliente leia "¡Mensaje enviado!
 * Te respondo en menos de 24 horas" y el mensaje no existia en ningun lado.
 * Es el mismo patron de falla silenciosa de las cotizaciones de bodas.
 */
describe('ContactComponent', () => {
  let component: ContactComponent;
  let http: { post: jest.Mock };

  const fillValidForm = () => {
    component.form.patchValue({
      nombre: 'Ana',
      email: 'ana@example.com',
      tipo: 'Otro',
      mensaje: 'Quiero una sesion familiar en diciembre.',
      captcha: String(component.captchaAnswer),
    });
  };

  beforeEach(() => {
    http = { post: jest.fn().mockReturnValue(of({})) };
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    component = TestBed.runInInjectionContext(() => new ContactComponent());
    (component as any).http = http;
  });

  it('should report success only when the API accepts the message', () => {
    fillValidForm();
    component.onSubmit();

    expect(http.post).toHaveBeenCalled();
    expect(component.sent()).toBe(true);
    expect(component.sendError()).toBe(false);
  });

  it('should surface an error instead of faking success when the API fails', () => {
    http.post.mockReturnValue(throwError(() => new Error('503')));
    fillValidForm();
    component.onSubmit();

    expect(component.sendError()).toBe(true);
    expect(component.sent()).toBe(false);
  });

  it('should keep what the visitor typed when sending fails', () => {
    // Limpiar el formulario tras un fallo obliga a reescribirlo todo: en la
    // practica el visitante se va y el lead se pierde igual.
    http.post.mockReturnValue(throwError(() => new Error('503')));
    fillValidForm();
    component.onSubmit();

    expect(component.form.get('mensaje')?.value).toBe('Quiero una sesion familiar en diciembre.');
    expect(component.form.get('email')?.value).toBe('ana@example.com');
  });

  it('should clear the form after a successful send', () => {
    fillValidForm();
    component.onSubmit();
    expect(component.form.get('mensaje')?.value).toBeFalsy();
  });

  it('should toggle the sending flag around the request', () => {
    expect(component.sending()).toBe(false);
    fillValidForm();
    component.onSubmit();
    expect(component.sending()).toBe(false); // of() resuelve sincrono
  });

  it('should not post when the captcha answer is wrong', () => {
    fillValidForm();
    component.form.patchValue({ captcha: String(component.captchaAnswer + 1) });
    component.onSubmit();

    expect(http.post).not.toHaveBeenCalled();
    expect(component.captchaError()).toBe(true);
  });

  it('should not post an invalid form', () => {
    component.onSubmit();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('should never log the submitted data', () => {
    // El componente hacia console.log('Form submitted:', ...) en produccion:
    // nombre, email y mensaje del visitante visibles en la consola del navegador.
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    fillValidForm();
    component.onSubmit();

    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('should publish the studio contact details from the shared source', () => {
    const value = (label: string) =>
      component.infoItems.find(i => i.label === label)?.value;

    expect(value('WhatsApp')).toBe(WHATSAPP_DISPLAY);
    expect(value('Instagram')).toBe(INSTAGRAM_HANDLE);
  });

  describe('accesibilidad y uso en móvil', () => {
    function render() {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [ContactComponent], providers: [provideHttpClient()] });
      const fixture = TestBed.createComponent(ContactComponent);
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('should_make_phone_email_and_instagram_tappable_links', () => {
      // Regresión: eran texto plano; en celular no se podía llamar ni escribir.
      const hrefs = Array.from(render().querySelectorAll<HTMLAnchorElement>('.contact__info-value'))
        .map((a) => a.getAttribute('href'));
      expect(hrefs).toContain('tel:+524424906891');
      expect(hrefs).toContain('mailto:hola@danlunaphoto.com');
      expect(hrefs).toContain('https://www.instagram.com/danlunaphotos');
    });

    it('should_label_every_form_field', () => {
      const el = render();
      el.querySelectorAll('input, select, textarea').forEach((field) => {
        const label = el.querySelector(`label[for="${field.id}"]`);
        expect(field.id).toBeTruthy();
        expect(label).not.toBeNull();
      });
    });

    it('should_make_the_submit_button_magnetic_and_shiny', () => {
      const submit = render().querySelector('.contact__submit')!;
      expect(submit.classList).toContain('dl-magnetic');
      expect(submit.classList).toContain('dl-shine');
    });

    it('should_enable_browser_autocomplete_for_name_and_email', () => {
      const el = render();
      expect(el.querySelector('input[formControlName="nombre"]')?.getAttribute('autocomplete')).toBe('name');
      expect(el.querySelector('input[formControlName="email"]')?.getAttribute('autocomplete')).toBe('email');
    });
  });
});
