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

  it('should_toggle_favorite_with_photo_id', () => {
    service.toggleFavorite(slug, token, 'p1').subscribe();
    const req = httpMock.expectOne(`${base}/favorite`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ photoId: 'p1' });
    expect(req.request.headers.get('X-Gallery-Token')).toBe(token);
    req.flush({ favorite: true });
  });

  it('should_request_download_by_email', () => {
    service.requestDownload(slug, token, { email: 'a@b.com' }).subscribe();
    const req = httpMock.expectOne(`${base}/download`);
    expect(req.request.body).toEqual({ email: 'a@b.com' });
    req.flush({ message: 'ok' });
  });

  it('should_request_download_by_photo_ids', () => {
    service.requestDownload(slug, token, { photoIds: ['a', 'b'] }).subscribe();
    const req = httpMock.expectOne(`${base}/download`);
    expect(req.request.body).toEqual({ photoIds: ['a', 'b'] });
    req.flush({ downloadUrl: 'x' });
  });

  it('should_track_view', () => {
    service.trackView(slug).subscribe();
    const req = httpMock.expectOne(`${base}/view`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
