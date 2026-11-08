import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GalleryPhoto, FavoriteResponse, DownloadJob, GalleryInfoResponse, PhotoDownload } from './gallery.models';

/**
 * Acceso a datos del visor de galeria (patron Repository/Facade).
 *
 * Unico lugar que conoce los endpoints y el header de token del cliente. Antes
 * ese `new HttpHeaders({'X-Gallery-Token'})` estaba repetido 4 veces dentro del
 * componente (viola DRY) y mezclaba acceso a datos con presentacion (viola SRP).
 *
 * El componente depende de esta abstraccion via DI (Dependency Inversion), no
 * de HttpClient directamente.
 */
export interface DownloadRequest {
  photoIds?: string[];
}

@Injectable({ providedIn: 'root' })
export class GalleryApiService {
  private http = inject(HttpClient);

  private base(slug: string): string {
    return `${environment.apiUrl}/gallery/${slug}`;
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ 'X-Gallery-Token': token });
  }

  loadInfo(slug: string): Observable<GalleryInfoResponse> {
    return this.http.get<GalleryInfoResponse>(this.base(slug));
  }

  loadPhotos(slug: string, token: string): Observable<GalleryPhoto[]> {
    return this.http.get<GalleryPhoto[]>(`${this.base(slug)}/photos`, {
      headers: this.authHeaders(token),
    });
  }

  /** Estado deseado, no "alternar": repetir la petición deja lo mismo (idempotente). */
  setFavorite(slug: string, token: string, photoId: string, favorite: boolean): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(
      `${this.base(slug)}/favorite`,
      { photoId, favorite },
      { headers: this.authHeaders(token) },
    );
  }

  /** Registra la descarga de una foto y devuelve un enlace recién firmado para bajarla. */
  downloadPhoto(slug: string, token: string, photoId: string): Observable<PhotoDownload> {
    return this.http.post<PhotoDownload>(`${this.base(slug)}/photo-download`, { photoId }, {
      headers: this.authHeaders(token),
    });
  }

  requestDownload(slug: string, token: string, body: DownloadRequest): Observable<DownloadJob> {
    return this.http.post<DownloadJob>(`${this.base(slug)}/download`, body, {
      headers: this.authHeaders(token),
    });
  }

  checkDownload(slug: string, token: string, jobId: string): Observable<DownloadJob> {
    return this.http.post<DownloadJob>(`${this.base(slug)}/download`, { jobId }, {
      headers: this.authHeaders(token),
    });
  }

  trackView(slug: string): Observable<unknown> {
    return this.http.post(`${this.base(slug)}/view`, {});
  }
}
