import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GalleryPhoto, FavoriteResponse, DownloadResponse } from './gallery.models';

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
  email?: string;
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

  loadPhotos(slug: string, token: string): Observable<GalleryPhoto[]> {
    return this.http.get<GalleryPhoto[]>(`${this.base(slug)}/photos`, {
      headers: this.authHeaders(token),
    });
  }

  toggleFavorite(slug: string, token: string, photoId: string): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(
      `${this.base(slug)}/favorite`,
      { photoId },
      { headers: this.authHeaders(token) },
    );
  }

  requestDownload(slug: string, token: string, body: DownloadRequest): Observable<DownloadResponse> {
    return this.http.post<DownloadResponse>(`${this.base(slug)}/download`, body, {
      headers: this.authHeaders(token),
    });
  }

  trackView(slug: string): Observable<unknown> {
    return this.http.post(`${this.base(slug)}/view`, {});
  }
}
