import { DOWNLOAD_POLL_MS, DownloadPort, GalleryDownload } from './gallery-download';
import { DownloadJob } from './gallery.models';

const job = (over: Partial<DownloadJob> = {}): DownloadJob => ({ jobId: 'j1', status: 'pending', processed: 0, total: 10, skipped: 0, ...over });

function setup() {
  const port: jest.Mocked<DownloadPort> = {
    start: jest.fn().mockResolvedValue(job()),
    check: jest.fn().mockResolvedValue(job({ status: 'building', processed: 3 })),
  };
  const saved: Record<string, string> = {};
  const storage = {
    getItem: (k: string) => saved[k] ?? null,
    setItem: (k: string, v: string) => { saved[k] = v; },
    removeItem: (k: string) => { delete saved[k]; },
  };
  const onSessionExpired = jest.fn();
  const navigate = jest.fn();
  const download = new GalleryDownload(port, storage, 'boda', onSessionExpired, navigate);
  return { port, saved, storage, onSessionExpired, navigate, download };
}

const tick = () => jest.advanceTimersByTimeAsync(DOWNLOAD_POLL_MS);

describe('GalleryDownload', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should_start_idle', () => {
    expect(setup().download.state.kind).toBe('idle');
  });

  it('should_show_progress_while_the_zip_is_built', async () => {
    const { download } = setup();
    await download.start();
    expect(download.state).toEqual({ kind: 'preparing', processed: 0, total: 10 });
    await tick();
    expect(download.state).toEqual({ kind: 'preparing', processed: 3, total: 10 });
    download.stop();
  });

  it('should_request_only_the_selected_photos', async () => {
    const { download, port } = setup();
    await download.start(['a', 'b']);
    expect(port.start).toHaveBeenCalledWith(['a', 'b']);
    download.stop();
  });

  it('should_keep_polling_until_it_is_ready_and_then_stop', async () => {
    const { download, port } = setup();
    await download.start();
    port.check.mockResolvedValue(job({ status: 'ready', processed: 10, downloadUrl: 'https://s3/z.zip' }));
    await tick();
    expect(download.state).toEqual({ kind: 'ready', skipped: 0 });
    const calls = port.check.mock.calls.length;
    await tick();
    expect(port.check.mock.calls.length).toBe(calls);
  });

  it('should_tell_how_many_photos_were_left_out', async () => {
    const { download, port } = setup();
    port.start.mockResolvedValue(job({ status: 'ready', skipped: 2, downloadUrl: 'u' }));
    await download.start();
    expect(download.state).toEqual({ kind: 'ready', skipped: 2 });
  });

  it('should_ask_for_a_fresh_url_when_saving_because_the_old_one_may_have_expired', async () => {
    const { download, port, navigate } = setup();
    port.start.mockResolvedValue(job({ status: 'ready', downloadUrl: 'vieja' }));
    await download.start();
    port.check.mockResolvedValue(job({ status: 'ready', downloadUrl: 'nueva' }));
    await download.save();
    expect(navigate).toHaveBeenCalledWith('nueva');
  });

  it('should_show_the_failure_when_saving_finds_the_zip_gone', async () => {
    const { download, port, navigate } = setup();
    port.start.mockResolvedValue(job({ status: 'ready', downloadUrl: 'u' }));
    await download.start();
    port.check.mockRejectedValue({ status: 404, error: { message: 'Esta descarga ya no existe.' } });
    await download.save();
    expect(navigate).not.toHaveBeenCalled();
    expect(download.state).toEqual({ kind: 'failed', message: 'Esta descarga ya no existe.' });
  });

  it('should_show_the_server_message_when_the_job_fails', async () => {
    const { download, port } = setup();
    await download.start();
    port.check.mockResolvedValue(job({ status: 'failed', message: 'Selecciona menos fotos' }));
    await tick();
    expect(download.state).toEqual({ kind: 'failed', message: 'Selecciona menos fotos' });
  });

  it('should_show_the_server_message_when_it_cannot_start', async () => {
    const { download, port } = setup();
    port.start.mockRejectedValue({ status: 429, error: { message: 'Ya hay varias descargas' } });
    await download.start();
    expect(download.state).toEqual({ kind: 'failed', message: 'Ya hay varias descargas' });
  });

  it('should_retry_with_the_same_selection', async () => {
    const { download, port } = setup();
    port.start.mockRejectedValueOnce({ status: 500 });
    await download.start(['a']);
    await download.retry();
    expect(port.start).toHaveBeenLastCalledWith(['a']);
    expect(download.state.kind).toBe('preparing');
    download.stop();
  });

  it('should_send_the_client_back_to_login_when_the_session_expires', async () => {
    const { download, port, onSessionExpired } = setup();
    await download.start();
    port.check.mockRejectedValue({ status: 401 });
    await tick();
    expect(onSessionExpired).toHaveBeenCalled();
    expect(download.state.kind).toBe('idle');
  });

  it('should_survive_a_brief_network_failure', async () => {
    const { download, port } = setup();
    await download.start();
    port.check.mockRejectedValueOnce({ status: 0 });
    await tick();
    expect(download.state.kind).toBe('preparing');
    await tick();
    expect(download.state).toEqual({ kind: 'preparing', processed: 3, total: 10 });
    download.stop();
  });

  it('should_give_up_when_the_connection_stays_down', async () => {
    const { download, port } = setup();
    await download.start();
    port.check.mockRejectedValue({ status: 0 });
    for (let i = 0; i < 6; i++) await tick();
    expect(download.state.kind).toBe('failed');
  });

  it('should_resume_after_reloading_the_page', async () => {
    const { download, port, storage } = setup();
    await download.start();
    download.stop();

    const again = new GalleryDownload(port, storage, 'boda', jest.fn(), jest.fn());
    await again.resume();
    expect(port.check).toHaveBeenCalledWith('j1');
    expect(again.state).toEqual({ kind: 'preparing', processed: 3, total: 10 });
    again.stop();
  });

  it('should_stay_idle_on_resume_when_the_job_no_longer_exists', async () => {
    const { download, port, storage, saved } = setup();
    await download.start();
    download.stop();
    port.check.mockRejectedValue({ status: 404, error: { message: 'ya no existe' } });

    const again = new GalleryDownload(port, storage, 'boda', jest.fn(), jest.fn());
    await again.resume();
    expect(again.state.kind).toBe('idle');
    expect(Object.keys(saved)).toEqual([]);
  });

  it('should_do_nothing_on_resume_without_a_previous_download', async () => {
    const { download, port } = setup();
    await download.resume();
    expect(port.check).not.toHaveBeenCalled();
    expect(download.state.kind).toBe('idle');
  });

  it('should_forget_the_job_when_dismissed', async () => {
    const { download, port, saved } = setup();
    port.start.mockResolvedValue(job({ status: 'ready', downloadUrl: 'u' }));
    await download.start();
    download.dismiss();
    expect(download.state.kind).toBe('idle');
    expect(Object.keys(saved)).toEqual([]);
  });

  it('should_stop_polling_when_the_page_closes', async () => {
    const { download, port } = setup();
    await download.start();
    download.stop();
    await tick();
    expect(port.check).not.toHaveBeenCalled();
  });

  it('should_ignore_an_answer_that_arrives_after_closing', async () => {
    const { download, port } = setup();
    let answer!: (j: DownloadJob) => void;
    port.check.mockReturnValue(new Promise((resolve) => { answer = resolve; }));
    await download.start();
    await tick();
    download.stop();
    answer(job({ status: 'building', processed: 9 }));
    await jest.advanceTimersByTimeAsync(0);
    expect(download.state).toEqual({ kind: 'preparing', processed: 0, total: 10 });
    await tick();
    expect(port.check).toHaveBeenCalledTimes(1);
  });
});
