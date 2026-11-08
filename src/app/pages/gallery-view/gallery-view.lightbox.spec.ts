import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of, timer, switchMap, throwError } from 'rxjs';
import { GalleryViewComponent } from './gallery-view.component';
import { GalleryApiService } from './gallery-api.service';
import { GalleryPhoto, PhotoDownload } from './gallery.models';

/** Favoritas y descargas desde la cuadrícula y el visor ampliado, con el servidor simulado. */
describe('GalleryViewComponent · favoritas y descargas', () => {
  const photo = (id: string): GalleryPhoto => ({ _id: id, filename: `${id}.jpg`, thumbUrl: `t/${id}`, originalUrl: `o/${id}` });
  let favoriteReplies: Subject<{ favorite: boolean }>[];
  let downloadReplies: Subject<PhotoDownload>[];
  let api: Record<string, jest.Mock>;
  let router: { navigate: jest.Mock };

  function setup() {
    favoriteReplies = [];
    downloadReplies = [];
    api = {
      setFavorite: jest.fn(() => { const s = new Subject<{ favorite: boolean }>(); favoriteReplies.push(s); return s; }),
      downloadPhoto: jest.fn(() => { const s = new Subject<PhotoDownload>(); downloadReplies.push(s); return s; }),
      loadPhotos: jest.fn(() => of([photo('a'), photo('b'), photo('c')])),
      loadInfo: jest.fn(() => of({})),
      trackView: jest.fn(() => of({})),
      requestDownload: jest.fn(), checkDownload: jest.fn(),
    };
    router = { navigate: jest.fn() };
    sessionStorage.clear();
    sessionStorage.setItem('gallery_token_boda', 'tk');
    sessionStorage.setItem('gallery_data_boda', JSON.stringify({ title: 'Boda', sets: [], downloads: { enabled: true } }));
    TestBed.configureTestingModule({
      imports: [GalleryViewComponent],
      providers: [
        { provide: GalleryApiService, useValue: api },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'boda' } } } },
      ],
    });
    const fixture = TestBed.createComponent(GalleryViewComponent);
    const c = fixture.componentInstance;
    const opened: string[] = [];
    jest.spyOn(c, 'openFile').mockImplementation((url: string) => { opened.push(url); });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const lbHeart = () => el.querySelector<HTMLButtonElement>('.fav-btn-lb')!;
    const lbDownload = () => el.querySelector<HTMLButtonElement>('.dl-btn')!;
    const gridHeart = (i: number) => el.querySelectorAll<HTMLButtonElement>('.fav-btn')[i];
    const click = (b: HTMLElement) => { b.click(); fixture.detectChanges(); };
    const reply = async <T,>(s: Subject<T>, value: T) => { s.next(value); s.complete(); await settle(); fixture.detectChanges(); };
    return { fixture, c, el, lbHeart, lbDownload, gridHeart, click, reply, opened };
  }

  /** Deja correr las promesas pendientes (los await encadenados de FavoriteSync y SingleFlight). */
  const settle = () => new Promise((r) => setTimeout(r, 0));
  /** El error HTTP llega después, como en el navegador (un rechazo síncrono confunde a zone.js). */
  const failLater = (status: number) => timer(0).pipe(switchMap(() => throwError(() => ({ status }))));
  const isFav = (c: GalleryViewComponent, id: string) => !!c.photos().find((p) => p._id === id)?.isFavorite;

  it('should_mark_the_photo_reached_by_navigation_and_fill_the_heart', async () => {
    const { fixture, c, lbHeart, click, reply } = setup();
    c.openLightbox(c.photos()[0]);
    c.nextPhoto();
    fixture.detectChanges();
    click(lbHeart());

    expect(api['setFavorite']).toHaveBeenLastCalledWith('boda', 'tk', 'b', true);
    expect(lbHeart().classList).toContain('active');
    expect(lbHeart().querySelector('svg')!.getAttribute('fill')).toBe('currentColor');
    await reply(favoriteReplies[0], { favorite: true });
    expect(isFav(c, 'b')).toBe(true);
  });

  it('should_keep_lightbox_and_grid_in_sync_after_several_taps', async () => {
    const { fixture, c, lbHeart, gridHeart, click, reply } = setup();
    c.openLightbox(c.photos()[0]);
    fixture.detectChanges();
    click(lbHeart());
    click(lbHeart());
    click(lbHeart());
    click(lbHeart());

    expect(api['setFavorite']).toHaveBeenCalledTimes(1);
    expect(isFav(c, 'a')).toBe(false);
    expect(gridHeart(0).classList).not.toContain('active');
    await reply(favoriteReplies[0], { favorite: true });
    expect(api['setFavorite']).toHaveBeenLastCalledWith('boda', 'tk', 'a', false);
    await reply(favoriteReplies[1], { favorite: false });
    expect(api['setFavorite']).toHaveBeenCalledTimes(2);
    expect(isFav(c, 'a')).toBe(false);
    expect(lbHeart().classList).not.toContain('active');
  });

  it('should_undo_the_heart_and_warn_when_saving_fails', async () => {
    const { fixture, c, gridHeart, click } = setup();
    api['setFavorite'].mockReturnValueOnce(failLater(0));
    click(gridHeart(1));
    await settle();
    fixture.detectChanges();
    expect(isFav(c, 'b')).toBe(false);
    expect(c.notice()).toContain('favorita');
  });

  it('should_return_to_the_access_page_when_the_session_expired', async () => {
    const { fixture, gridHeart, click } = setup();
    api['setFavorite'].mockReturnValueOnce(failLater(401));
    click(gridHeart(0));
    await settle();
    expect(router.navigate).toHaveBeenCalledWith(['/galeria', 'boda']);
  });

  it('should_record_a_single_download_and_ignore_extra_clicks', async () => {
    const { fixture, c, lbDownload, click, reply, opened } = setup();
    c.openLightbox(c.photos()[2]);
    fixture.detectChanges();
    click(lbDownload());
    click(lbDownload());
    click(lbDownload());

    expect(api['downloadPhoto']).toHaveBeenCalledTimes(1);
    expect(api['downloadPhoto']).toHaveBeenCalledWith('boda', 'tk', 'c');
    expect(lbDownload().getAttribute('aria-busy')).toBe('true');
    await reply(downloadReplies[0], { url: 'https://s3/c.jpg', filename: 'c.jpg' });
    expect(opened).toEqual(['https://s3/c.jpg']);
    expect(lbDownload().getAttribute('aria-busy')).toBe('false');
  });

  it('should_warn_when_the_single_download_fails', async () => {
    const { fixture, c, lbDownload, click, opened } = setup();
    api['downloadPhoto'].mockReturnValueOnce(failLater(500));
    c.openLightbox(c.photos()[0]);
    fixture.detectChanges();
    click(lbDownload());
    await settle();
    expect(opened).toEqual([]);
    expect(c.notice()).toContain('descargar');
  });

  it('should_show_the_reason_when_the_server_refuses_the_download', async () => {
    const { fixture, c, lbDownload, click } = setup();
    api['downloadPhoto'].mockReturnValueOnce(
      timer(0).pipe(switchMap(() => throwError(() => ({ status: 403, error: { message: 'Las descargas no están habilitadas en esta galería' } })))));
    c.openLightbox(c.photos()[0]);
    fixture.detectChanges();
    click(lbDownload());
    await settle();
    expect(c.notice()).toBe('Las descargas no están habilitadas en esta galería');
  });

  it('should_keep_navigating_after_unmarking_a_photo_while_viewing_only_favorites', async () => {
    const { fixture, c, lbHeart, click, reply } = setup();
    for (const id of ['a', 'b', 'c']) {
      c.toggleFav(c.photos().find((p) => p._id === id)!);
      await reply(favoriteReplies[favoriteReplies.length - 1], { favorite: true });
    }
    c.showFavoritesOnly = true;
    c.openLightbox(c.photos()[1]);
    fixture.detectChanges();
    click(lbHeart());
    await reply(favoriteReplies[favoriteReplies.length - 1], { favorite: false });

    expect(c.lightboxPhoto()?._id).toBe('b');
    c.nextPhoto();
    expect(c.lightboxPhoto()?._id).toBe('c');
    c.closeLightbox();
    fixture.detectChanges();
    expect(c.displayedPhotos().map((p) => p._id)).toEqual(['a', 'c']);
  });
});
