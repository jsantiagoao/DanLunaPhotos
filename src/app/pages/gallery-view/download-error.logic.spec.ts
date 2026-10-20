import { downloadErrorAction } from './download-error.logic';

describe('download-error.logic', () => {
  it('should_send_the_client_back_to_login_when_the_session_expired', () => {
    expect(downloadErrorAction(401)).toEqual({ type: 'relogin' });
  });

  it('should_show_the_server_message_when_downloads_are_disabled', () => {
    expect(downloadErrorAction(403, 'Descargas no habilitadas')).toEqual({ type: 'alert', message: 'Descargas no habilitadas' });
  });

  it('should_fall_back_to_a_generic_message', () => {
    expect(downloadErrorAction(500)).toEqual({ type: 'alert', message: 'No se pudo generar la descarga. Inténtalo de nuevo.' });
    expect(downloadErrorAction(0, '')).toEqual({ type: 'alert', message: 'No se pudo generar la descarga. Inténtalo de nuevo.' });
  });
});
