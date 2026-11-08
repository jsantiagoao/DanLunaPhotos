import { DOWNLOAD_ERROR, GalleryPhotoActions, PhotoActionsView } from './gallery-photo-actions';
import { FAVORITE_ERROR } from './favorite-sync';

const settle = () => new Promise((r) => setTimeout(r, 0));

describe('GalleryPhotoActions', () => {
  function setup(port: { setFavorite?: jest.Mock; downloadUrl?: jest.Mock } = {}) {
    const view: jest.Mocked<PhotoActionsView> = {
      showFavorite: jest.fn(), notice: jest.fn(), sessionExpired: jest.fn(), openFile: jest.fn(),
    };
    const actions = new GalleryPhotoActions({
      setFavorite: port.setFavorite ?? jest.fn((_id: string, f: boolean) => Promise.resolve(f)),
      downloadUrl: port.downloadUrl ?? jest.fn(() => Promise.resolve('https://s3/a.jpg')),
    }, view);
    return { actions, view };
  }

  it('should_show_the_favorite_and_save_it', async () => {
    const setFavorite = jest.fn(() => Promise.resolve(true));
    const { actions, view } = setup({ setFavorite });
    actions.toggleFavorite('a', false);
    await settle();
    expect(setFavorite).toHaveBeenCalledWith('a', true);
    expect(view.showFavorite).toHaveBeenLastCalledWith('a', true);
  });

  it('should_send_back_to_the_access_page_when_the_session_expired_on_a_favorite', async () => {
    const { actions, view } = setup({ setFavorite: jest.fn(() => Promise.reject({ status: 401 })) });
    actions.toggleFavorite('a', false);
    await settle();
    expect(view.sessionExpired).toHaveBeenCalled();
    expect(view.showFavorite).toHaveBeenLastCalledWith('a', false);
    expect(view.notice).toHaveBeenCalledWith(FAVORITE_ERROR);
  });

  it('should_open_the_signed_link_once_for_repeated_clicks', async () => {
    const downloadUrl = jest.fn(() => Promise.resolve('https://s3/a.jpg'));
    const { actions, view } = setup({ downloadUrl });
    void actions.download('a');
    void actions.download('a');
    expect(actions.isDownloading('a')).toBe(true);
    await settle();
    expect(downloadUrl).toHaveBeenCalledTimes(1);
    expect(view.openFile).toHaveBeenCalledWith('https://s3/a.jpg');
    expect(actions.isDownloading('a')).toBe(false);
  });

  it('should_use_the_server_reason_or_a_generic_message_when_the_download_fails', async () => {
    const reasons = [{ status: 404, error: { message: 'Esa foto ya no está en la galería' } }, { status: 0 }];
    const downloadUrl = jest.fn(() => Promise.reject(reasons.shift()));
    const { actions, view } = setup({ downloadUrl });
    await actions.download('a');
    await actions.download('a');
    expect(view.notice.mock.calls).toEqual([['Esa foto ya no está en la galería'], [DOWNLOAD_ERROR]]);
    expect(view.openFile).not.toHaveBeenCalled();
  });

  it('should_send_back_to_the_access_page_when_the_session_expired_on_a_download', async () => {
    const { actions, view } = setup({ downloadUrl: jest.fn(() => Promise.reject({ status: 401 })) });
    await actions.download('a');
    expect(view.sessionExpired).toHaveBeenCalled();
    expect(view.notice).not.toHaveBeenCalled();
  });
});
