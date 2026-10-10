import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { MAIN_MENU, HOME_SECTIONS } from './navbar-menu';

describe('NavbarComponent', () => {
  const allItems = MAIN_MENU.flatMap((item) => (item.submenu ? item.submenu : [item as { label: string; href: string }]));

  function setup() {
    TestBed.configureTestingModule({ imports: [NavbarComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    return { fixture, cmp: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  describe('menú (regresión: 10 opciones apuntaban a anclas inexistentes)', () => {
    it('should_only_point_anchors_to_sections_that_exist_on_the_home', () => {
      const anchors = allItems.filter((i) => i.href.startsWith('#')).map((i) => i.href.slice(1));
      anchors.forEach((id) => expect(HOME_SECTIONS).toContain(id));
    });

    it('should_send_services_without_a_page_to_whatsapp_with_the_service_named', () => {
      const pareja = allItems.find((i) => i.label === 'En Pareja')!;
      expect(pareja.href).toContain('https://wa.me/');
      expect(decodeURIComponent(pareja.href)).toContain('En Pareja');
    });

    it('should_keep_the_dedicated_pages_as_internal_routes', () => {
      expect(allItems.find((i) => i.label === 'Bodas')!.href).toBe('/fotografia-bodas-queretaro');
      expect(allItems.find((i) => i.label === 'Bautizos')!.href).toBe('/fotografia-bautizo-queretaro');
    });

    it('should_open_whatsapp_links_in_a_new_tab', () => {
      const { el, cmp, fixture } = setup();
      cmp.toggleSubmenu('Sesiones al Aire Libre');
      fixture.detectChanges();
      const link = Array.from(el.querySelectorAll<HTMLAnchorElement>('.navbar__submenu a'))
        .find((a) => a.textContent?.trim() === 'En Pareja')!;
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    });
  });

  describe('menú móvil', () => {
    it('should_expose_the_open_state_on_the_hamburger', () => {
      const { el, cmp, fixture } = setup();
      const burger = el.querySelector('.navbar__hamburger')!;
      expect(burger.getAttribute('aria-expanded')).toBe('false');
      cmp.toggleMenu();
      fixture.detectChanges();
      expect(burger.getAttribute('aria-expanded')).toBe('true');
    });

    it('should_offer_the_booking_cta_inside_the_mobile_menu', () => {
      const { el } = setup();
      const cta = el.querySelector<HTMLAnchorElement>('.navbar__links .navbar__mobile-cta');
      expect(cta?.href).toContain('https://wa.me/');
    });

    it('should_close_when_tapping_outside_the_navbar', () => {
      const { cmp } = setup();
      cmp.toggleMenu();
      cmp.onDocumentClick({ target: document.body } as unknown as MouseEvent);
      expect(cmp.menuOpen()).toBe(false);
    });

    it('should_close_with_escape', () => {
      const { cmp } = setup();
      cmp.toggleMenu();
      cmp.onEscape();
      expect(cmp.menuOpen()).toBe(false);
    });
  });

  describe('header al hacer scroll', () => {
    function scrollTo(y: number) {
      Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    }

    afterEach(() => scrollTo(0));

    it('should_compact_the_header_after_leaving_the_top', () => {
      const { el, cmp, fixture } = setup();
      scrollTo(120);
      cmp.onScroll();
      fixture.detectChanges();
      expect(el.querySelector('.navbar')!.classList).toContain('navbar--scrolled');
    });

    it('should_hide_on_scroll_down_and_show_on_scroll_up', () => {
      const { el, cmp, fixture } = setup();
      scrollTo(600); cmp.onScroll();
      scrollTo(700); cmp.onScroll();
      fixture.detectChanges();
      expect(el.querySelector('.navbar')!.classList).toContain('navbar--hidden');
      scrollTo(650); cmp.onScroll();
      fixture.detectChanges();
      expect(el.querySelector('.navbar')!.classList).not.toContain('navbar--hidden');
    });
  });
});
