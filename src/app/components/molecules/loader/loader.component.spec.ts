import { LoaderComponent, LOADER_SESSION_KEY, LOADER_VISIBLE_MS, LOADER_FADE_MS } from './loader.component';

/**
 * El loader tapaba la pantalla 4.7s (4200ms + 500ms de fade) en cada visita, sin
 * guardar nada en sesion y sin mirar prefers-reduced-motion. Era la primera cosa
 * que veia un cliente y le costaba el LCP al home. Estas pruebas fijan el
 * contrato nuevo: corto, una sola vez por sesion, y desactivable.
 */
describe('LoaderComponent', () => {

  // PLATFORM_ID es InjectionToken<Object> pero en runtime Angular inyecta el
  // string 'browser' | 'server'. El resto del repo tipa el parametro como
  // `object`, asi que el cast vive aqui y no en el componente.
  const platform = (id: 'browser' | 'server') => new LoaderComponent(id as unknown as object);
  const browser = () => platform('browser');
  const server = () => platform('server');

  /** jsdom no implementa matchMedia; cada prueba declara que responde. */
  function stubReducedMotion(reduce: boolean): void {
    (window as any).matchMedia = jest.fn().mockReturnValue({ matches: reduce });
  }

  beforeEach(() => {
    jest.useFakeTimers();
    sessionStorage.clear();
    stubReducedMotion(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should play on the first visit of the session', () => {
    const component = browser();
    component.ngOnInit();
    expect(component.isLoading()).toBe(true);
  });

  it('should not play again once it has been seen in this session', () => {
    const first = browser();
    first.ngOnInit();
    jest.advanceTimersByTime(LOADER_VISIBLE_MS + LOADER_FADE_MS);

    const second = browser();
    second.ngOnInit();
    expect(second.isLoading()).toBe(false);
  });

  it('should mark the session as seen even when it never plays', () => {
    // Si no se marcara, quien llega con reduced-motion veria el loader en la
    // siguiente ruta que monte el componente.
    stubReducedMotion(true);
    const component = browser();
    component.ngOnInit();
    expect(sessionStorage.getItem(LOADER_SESSION_KEY)).toBe('1');
  });

  it('should be fully gone within 1.2s', () => {
    const component = browser();
    component.ngOnInit();

    jest.advanceTimersByTime(LOADER_VISIBLE_MS);
    expect(component.isExiting()).toBe(true);
    expect(component.isLoading()).toBe(true); // sigue en el DOM, desvaneciendose

    jest.advanceTimersByTime(LOADER_FADE_MS);
    expect(component.isLoading()).toBe(false);
    expect(LOADER_VISIBLE_MS + LOADER_FADE_MS).toBeLessThanOrEqual(1200);
  });

  it('should skip the animation when the user prefers reduced motion', () => {
    stubReducedMotion(true);
    const component = browser();
    component.ngOnInit();
    expect(component.isLoading()).toBe(false);
  });

  it('should never play while prerendering on the server', () => {
    // Sin esta guarda el prerender emitiria el HTML con el loader pintado encima.
    const component = server();
    component.ngOnInit();
    expect(component.isLoading()).toBe(false);
  });

  it('should still play when sessionStorage is unavailable', () => {
    // Safari en navegacion privada lanza al escribir. Preferimos animar de mas
    // antes que romper el home.
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    const component = browser();
    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.isLoading()).toBe(true);

    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('should clear pending timers on destroy', () => {
    const component = browser();
    component.ngOnInit();
    component.ngOnDestroy();

    jest.advanceTimersByTime(LOADER_VISIBLE_MS + LOADER_FADE_MS);
    // Sin el clear, los timers seguirian tocando un componente ya destruido.
    expect(jest.getTimerCount()).toBe(0);
  });
});
