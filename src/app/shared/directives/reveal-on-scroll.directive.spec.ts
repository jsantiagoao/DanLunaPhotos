import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RevealOnScrollDirective } from './reveal-on-scroll.directive';

/**
 * RevealOnScrollDirective anima la entrada de una sección cuando ésta
 * aparece en el viewport (IntersectionObserver). Es un átomo de
 * comportamiento reutilizable: sin lógica de negocio, SSR-safe y
 * respetuoso con prefers-reduced-motion. Estas pruebas fijan ese contrato.
 */

// Doble de IntersectionObserver controlable desde los tests.
class MockIntersectionObserver {
  static last: MockIntersectionObserver | null = null;
  callback: IntersectionObserverCallback;
  observed: Element[] = [];
  disconnected = false;
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    MockIntersectionObserver.last = this;
  }
  observe(el: Element) { this.observed.push(el); }
  unobserve(_el: Element) {}
  disconnect() { this.disconnected = true; }
  // Dispara la intersección manualmente en el test.
  trigger(isIntersecting: boolean, target: Element) {
    this.callback(
      [{ isIntersecting, target } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  standalone: true,
  imports: [RevealOnScrollDirective],
  template: `<div appReveal data-testid="host">contenido</div>`,
})
class HostComponent {}

function setup(platform: 'browser' | 'server' = 'browser', reducedMotion = false) {
  (globalThis as any).IntersectionObserver = MockIntersectionObserver as any;
  window.matchMedia = ((q: string) => ({
    matches: reducedMotion && q.includes('reduce'),
    media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as any;

  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [{ provide: PLATFORM_ID, useValue: platform }],
  });
  const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const host = fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
  return { fixture, host };
}

describe('RevealOnScrollDirective', () => {
  it('should_add_hidden_class_on_init_in_browser', () => {
    const { host } = setup('browser');
    expect(host.classList.contains('reveal')).toBe(true);
    expect(host.classList.contains('reveal--visible')).toBe(false);
  });

  it('should_add_visible_class_when_element_enters_viewport', () => {
    const { host } = setup('browser');
    MockIntersectionObserver.last!.trigger(true, host);
    expect(host.classList.contains('reveal--visible')).toBe(true);
  });

  it('should_not_reveal_while_element_is_out_of_viewport', () => {
    const { host } = setup('browser');
    MockIntersectionObserver.last!.trigger(false, host);
    expect(host.classList.contains('reveal--visible')).toBe(false);
  });

  it('should_reveal_immediately_without_observer_on_server', () => {
    const { host } = setup('server');
    // En SSR el contenido debe quedar visible (sin animación) para no ocultarlo.
    expect(host.classList.contains('reveal--visible')).toBe(true);
  });

  it('should_reveal_immediately_when_user_prefers_reduced_motion', () => {
    const { host } = setup('browser', true);
    expect(host.classList.contains('reveal--visible')).toBe(true);
  });

  it('should_disconnect_observer_on_destroy', () => {
    const { fixture } = setup('browser');
    const observer = MockIntersectionObserver.last!;
    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  describe('después del prerender (hidratación)', () => {
    // El servidor deja class="reveal--visible" para que el HTML se vea sin JS; al hidratar
    // esa clase se conservaba y ninguna sección animaba su entrada.
    @Component({
      standalone: true,
      imports: [RevealOnScrollDirective],
      template: `<div appReveal class="reveal--visible" data-testid="host">contenido</div>`,
    })
    class PrerenderedHost {}

    function setupPrerendered(top: number) {
      (globalThis as any).IntersectionObserver = MockIntersectionObserver as any;
      window.matchMedia = ((q: string) => ({ matches: false, media: q })) as any;
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue({ top, bottom: top + 500, left: 0, right: 0, width: 0, height: 500, x: 0, y: top, toJSON: () => ({}) });
      TestBed.configureTestingModule({ imports: [PrerenderedHost], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
      const fixture = TestBed.createComponent(PrerenderedHost);
      fixture.detectChanges();
      return fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
    }

    afterEach(() => jest.restoreAllMocks());

    it('should_hide_again_a_prerendered_section_that_is_below_the_viewport', () => {
      const host = setupPrerendered(window.innerHeight + 300);
      expect(host.classList.contains('reveal--visible')).toBe(false);
      MockIntersectionObserver.last!.trigger(true, host);
      expect(host.classList.contains('reveal--visible')).toBe(true);
    });

    it('should_keep_visible_a_prerendered_section_already_on_screen', () => {
      // Recargar a media página: lo que ya se ve no debe parpadear.
      const host = setupPrerendered(100);
      expect(host.classList.contains('reveal--visible')).toBe(true);
    });
  });
});
