import { FavoriteSync } from './favorite-sync';

/** Servidor simulado: cada guardado queda pendiente hasta que la prueba lo resuelva. */
function fakeServer() {
  const calls: { id: string; favorite: boolean; resolve: () => void; reject: () => void }[] = [];
  const save = jest.fn((id: string, favorite: boolean) => new Promise<boolean>((res, rej) => {
    calls.push({ id, favorite, resolve: () => res(favorite), reject: () => rej(new Error('red')) });
  }));
  return { save, calls };
}

const settle = () => new Promise((r) => setTimeout(r, 0));

describe('FavoriteSync', () => {
  function setup() {
    const server = fakeServer();
    const shown = new Map<string, boolean>();
    const errors: string[] = [];
    const sync = new FavoriteSync(
      { save: server.save },
      (id, favorite) => shown.set(id, favorite),
      (message) => errors.push(message),
    );
    return { sync, server, shown, errors };
  }

  it('should_show_the_change_immediately_before_the_server_answers', () => {
    const { sync, shown, server } = setup();
    sync.toggle('a', false);
    expect(shown.get('a')).toBe(true);
    expect(server.save).toHaveBeenCalledWith('a', true);
  });

  it('should_keep_one_request_in_flight_and_send_only_the_last_intent', async () => {
    const { sync, server, shown } = setup();
    sync.toggle('a', false);           // true  -> se envía
    sync.toggle('a', false);           // false -> espera
    sync.toggle('a', false);           // true  -> espera
    sync.toggle('a', false);           // false -> espera
    expect(server.save).toHaveBeenCalledTimes(1);
    expect(shown.get('a')).toBe(false);

    server.calls[0].resolve();
    await settle();
    expect(server.save).toHaveBeenCalledTimes(2);
    expect(server.calls[1].favorite).toBe(false);
    server.calls[1].resolve();
    await settle();
    expect(server.save).toHaveBeenCalledTimes(2);
    expect(sync.isPending('a')).toBe(false);
  });

  it('should_not_send_again_when_the_clicks_cancel_out_while_waiting', async () => {
    const { sync, server, shown } = setup();
    sync.toggle('a', false);           // true  -> se envía
    sync.toggle('a', false);           // false
    sync.toggle('a', false);           // true  = lo que ya va en camino
    server.calls[0].resolve();
    await settle();
    expect(server.save).toHaveBeenCalledTimes(1);
    expect(shown.get('a')).toBe(true);
  });

  it('should_return_to_the_saved_state_and_warn_when_the_server_fails', async () => {
    const { sync, server, shown, errors } = setup();
    sync.toggle('a', false);
    server.calls[0].reject();
    await settle();
    expect(shown.get('a')).toBe(false);
    expect(errors).toHaveLength(1);
    expect(sync.isPending('a')).toBe(false);
  });

  it('should_drop_pending_intents_after_a_failure', async () => {
    const { sync, server, shown } = setup();
    sync.toggle('a', true);            // false -> se envía
    sync.toggle('a', true);            // true  -> espera
    sync.toggle('a', true);            // false -> espera
    server.calls[0].reject();
    await settle();
    expect(server.save).toHaveBeenCalledTimes(1);
    expect(shown.get('a')).toBe(true);
  });

  it('should_sync_each_photo_independently', async () => {
    const { sync, server } = setup();
    sync.toggle('a', false);
    sync.toggle('b', false);
    expect(server.save).toHaveBeenCalledTimes(2);
    expect(server.calls.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('should_accept_a_new_toggle_after_settling', async () => {
    const { sync, server, shown } = setup();
    sync.toggle('a', false);
    server.calls[0].resolve();
    await settle();
    sync.toggle('a', true);
    expect(shown.get('a')).toBe(false);
    expect(server.calls[1].favorite).toBe(false);
  });

  it('should_trust_the_server_and_stop_when_it_saves_another_state', async () => {
    const save = jest.fn(() => Promise.resolve(false));
    const shown = new Map<string, boolean>();
    const sync = new FavoriteSync({ save }, (id, f) => shown.set(id, f), () => undefined);
    sync.toggle('a', false);
    await settle();
    expect(save).toHaveBeenCalledTimes(1);
    expect(shown.get('a')).toBe(false);
  });
});
