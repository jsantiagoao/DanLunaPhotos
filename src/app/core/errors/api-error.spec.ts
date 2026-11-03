import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiErrorInterceptor } from './api-error.interceptor';
import { errorForStatus, toApiErrorBody } from './api-error';

describe('toApiErrorBody', () => {
  it('conserva el mensaje de negocio del backend', () => {
    expect(toApiErrorBody(401, { message: 'Contraseña o PIN incorrectos' })).toEqual({
      code: 'UNAUTHENTICATED',
      message: 'Contraseña o PIN incorrectos',
    });
  });

  it.each([
    [500, 'Internal server error'],
    [504, 'Endpoint request timed out'],
    [403, 'Forbidden'],
    [404, 'Not found'],
  ])('traduce el mensaje en ingles del gateway: %i %s', (status, message) => {
    expect(toApiErrorBody(status, { message })).toEqual(errorForStatus(status));
  });

  it('no muestra detalles internos de un 5xx que no cumple el contrato', () => {
    expect(toApiErrorBody(500, { message: 'KeyError: privacy' })).toEqual(errorForStatus(500));
  });

  it('respeta un error del contrato aunque sea 5xx', () => {
    expect(toApiErrorBody(503, { code: 'ZIP_BUSY', message: 'Vuelve a intentarlo.' }).message).toBe('Vuelve a intentarlo.');
  });
});

describe('apiErrorInterceptor', () => {
  const URL = 'https://api.test/gallery/x';

  function setup() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    return { http: TestBed.inject(HttpClient), mock: TestBed.inject(HttpTestingController) };
  }

  it('entrega el error traducido y conserva el status', () => {
    const { http, mock } = setup();
    let recibido: any;
    http.get(URL).subscribe({ error: e => (recibido = e) });
    mock.expectOne(URL).flush({ message: 'Internal server error' }, { status: 500, statusText: 'Server Error' });
    expect(recibido.status).toBe(500);
    expect(recibido.error).toEqual(errorForStatus(500));
  });

  it('da un mensaje claro a un fallo de red', () => {
    const { http, mock } = setup();
    let recibido: any;
    http.get(URL).subscribe({ error: e => (recibido = e) });
    mock.expectOne(URL).error(new ProgressEvent('error'), { status: 0 });
    expect(recibido.error.code).toBe('NETWORK_ERROR');
  });

  it('no altera las respuestas correctas', () => {
    const { http, mock } = setup();
    const ok = jest.fn();
    http.get(URL).subscribe(ok);
    mock.expectOne(URL).flush({ code: 'NAVIDAD10' });
    expect(ok).toHaveBeenCalledWith({ code: 'NAVIDAD10' });
  });
});
