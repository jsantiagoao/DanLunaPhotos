import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GalleryApiService } from './gallery-api.service';
import { environment } from '../../../environments/environment';

/**
 * GalleryApiService encapsula el acceso HTTP del visor (patron Repository).
 * Estas pruebas fijan que cada operacion pega al endpoint correcto y adjunta
 * el header de token, sin repetir ese detalle en el componente.
 */
describe('GalleryApiService', () => {
  let service: GalleryApiService;
  let httpMock: HttpTestingController;
  const slug = 'boda-ana';
  const token = 'tok-123';
  const base = `${environment.apiUrl}/gallery/${slug}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GalleryApiService],
    });
    service = TestBed.inject(GalleryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should_load_photos_with_token_header', () => {
    service.loadPhotos(slug, token).subscribe();
    const req = httpMock.expectOne(`${base}/photos`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Gallery-Token')).toBe(token);
    req.flush([]);
  });

  it('should_send_the_wanted_favorite_state', () => {
    service.setFavorite(slug, token, 'p1', false).subscribe();
    const req = httpMock.expectOne(`${base}/favorite`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ photoId: 'p1', favorite: false });
    expect(req.request.headers.get('X-Gallery-Token')).toBe(token);
    req.flush({ favorite: false });
  });

  it('should_request_a_single_photo_download', () => {
    service.downloadPhoto(slug, token, 'p1').subscribe();
    const req = httpMock.expectOne(`${base}/photo-download`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ photoId: 'p1' });
    expect(req.request.headers.get('X-Gallery-Token')).toBe(token);
    req.flush({ url: 'https://s3/a.jpg', filename: 'a.jpg' });
  });

  it('should_request_download_of_all_photos', () => {
    service.requestDownload(slug, token, {}).subscribe();
    const req = httpMock.expectOne(`${base}/download`);
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('X-Gallery-Token')).toBe(token);
    req.flush({ jobId: 'j1', status: 'pending', processed: 0, total: 3, skipped: 0 });
  });

  it('should_check_download_progress', () => {
    service.checkDownload(slug, token, 'j1').subscribe();
    const req = httpMock.expectOne(`${base}/download`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ jobId: 'j1' });
    expect(req.request.headers.get('X-Gallery-Token')).toBe(token);
    req.flush({ jobId: 'j1', status: 'building', processed: 1, total: 3, skipped: 0 });
  });

  it('should_request_download_by_photo_ids', () => {
    service.requestDownload(slug, token, { photoIds: ['a', 'b'] }).subscribe();
    const req = httpMock.expectOne(`${base}/download`);
    expect(req.request.body).toEqual({ photoIds: ['a', 'b'] });
    req.flush({ downloadUrl: 'x' });
  });

  it('should_track_view', () => {
    service.trackView(slug, token).subscribe();
    const req = httpMock.expectOne(`${base}/view`);
    expect(req.request.method).toBe('POST');
    // Con la sesión: el servidor cuenta una vista por sesión, no por recarga.
    expect(req.request.headers.get('X-Gallery-Token')).toBe(token);
    req.flush({});
  });
});
