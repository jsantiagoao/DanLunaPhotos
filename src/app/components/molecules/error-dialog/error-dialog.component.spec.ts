import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ErrorDialogComponent } from './error-dialog.component';

/**
 * Incidencia de la landing navideña: los errores del formulario salían hasta arriba
 * de la página y la clienta solo veía que "Reservar" no hacía nada. El modal pone el
 * mensaje frente a ella, sin importar dónde quedó el scroll.
 */
@Component({
  standalone: true,
  imports: [ErrorDialogComponent],
  template: `<app-error-dialog [message]="message()" (dismissed)="closed = closed + 1" />`,
})
class HostComponent {
  readonly message = signal<string | null>(null);
  closed = 0;
}

describe('ErrorDialogComponent', () => {
  function render(message: string | null) {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.message.set(message);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, host: fixture.componentInstance };
  }

  it('should_render_nothing_without_a_message', () => {
    expect(render(null).el.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('should_show_the_message_in_a_modal_alert_dialog', () => {
    const dialog = render('El teléfono debe tener 10 dígitos').el.querySelector('[role="alertdialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.textContent).toContain('El teléfono debe tener 10 dígitos');
  });

  it('should_be_labelled_by_its_title_and_described_by_the_message', () => {
    const { el } = render('Escribe tu nombre completo');
    const dialog = el.querySelector('[role="alertdialog"]')!;
    expect(el.querySelector('#' + dialog.getAttribute('aria-labelledby'))!.textContent).toContain('Revisa tus datos');
    expect(el.querySelector('#' + dialog.getAttribute('aria-describedby'))!.textContent).toContain('Escribe tu nombre completo');
  });

  it('should_focus_the_close_button_when_it_opens', async () => {
    const { fixture, el } = render('Escribe tu nombre completo');
    await fixture.whenStable();
    expect(document.activeElement).toBe(el.querySelector('.error-dialog__button'));
  });

  it('should_notify_when_the_button_is_clicked', () => {
    const { el, host } = render('Escribe tu nombre completo');
    (el.querySelector('.error-dialog__button') as HTMLButtonElement).click();
    expect(host.closed).toBe(1);
  });

  it('should_notify_when_escape_is_pressed', () => {
    const { el, host } = render('Escribe tu nombre completo');
    el.querySelector('[role="alertdialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(host.closed).toBe(1);
  });

  it('should_notify_when_the_backdrop_is_clicked_but_not_the_card', () => {
    const { el, host } = render('Escribe tu nombre completo');
    (el.querySelector('.error-dialog__card') as HTMLElement).click();
    expect(host.closed).toBe(0);
    (el.querySelector('.error-dialog') as HTMLElement).click();
    expect(host.closed).toBe(1);
  });
});
