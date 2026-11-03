import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GalleryInfoResponse, GalleryAuthResponse } from '../gallery-view/gallery.models';
import { galleryAccessMessage, galleryDisplayTitle } from '../gallery-view/gallery-delivery.logic';

@Component({
  selector: 'app-gallery-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gallery-login" [style.background-image]="coverUrl ? 'url(' + coverUrl + ')' : null" [style.background-position]="focalPoint">
      <div class="veil">
        <div class="entry">
          <span class="logo" role="img" aria-label="Dan Luna Photo"></span>
          <h1>{{ title || 'Tu galería' }}</h1>
          @if (unavailable(); as message) {
            <p class="unavailable" role="alert">{{ message }}</p>
          } @else {
            <p class="lead">Ingresa tus claves para ver tus fotos</p>
            <form class="form" (submit)="$event.preventDefault(); login()">
              <label class="field"><span>Contraseña</span><input type="password" name="password" autocomplete="off" [(ngModel)]="password" /></label>
              <label class="field"><span>PIN</span><input type="text" name="pin" inputmode="numeric" autocomplete="off" maxlength="6" [(ngModel)]="pin" /></label>
              @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
              <button type="submit" class="btn-login" [disabled]="loading()">{{ loading() ? 'Verificando…' : 'Entrar a mi galería' }}</button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-login { min-height: 100vh; min-height: 100svh; background: #2D2420 center / cover no-repeat; }
    .veil { display: flex; align-items: flex-end; justify-content: center; min-height: 100vh; min-height: 100svh; padding: 1.5rem; box-sizing: border-box; background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.18) 100%); }
    .entry { width: 100%; max-width: 420px; padding-bottom: clamp(1rem, 7vh, 4rem); color: #fff; text-align: center; animation: entryIn 0.6s cubic-bezier(.16, 1, .3, 1); }
    @keyframes entryIn { from { opacity: 0; transform: translateY(14px); } }
    .logo { display: block; width: 120px; height: 44px; margin: 0 auto 1rem; background: currentColor; -webkit-mask: url('/assets/images/logo-mark.png') center / contain no-repeat; mask: url('/assets/images/logo-mark.png') center / contain no-repeat; }
    h1 { margin: 0 0 0.5rem; font: 500 clamp(1.75rem, 5vw, 2.5rem)/1.15 'Fraunces', serif; text-shadow: 0 2px 20px rgba(0,0,0,0.5); }
    .lead { margin: 0 0 1.5rem; font-size: 0.95rem; opacity: 0.92; }
    .form { display: grid; gap: 0.75rem; }
    .field { display: grid; gap: 0.3rem; text-align: left; font-size: 0.8rem; font-weight: 600; }
    .field input { box-sizing: border-box; width: 100%; min-height: 48px; padding: 0 1rem; border: 1px solid rgba(255,255,255,0.55); border-radius: 10px; background: rgba(255,255,255,0.14); color: #fff; font-size: 1rem; backdrop-filter: blur(8px); }
    .field input:focus { outline: 2px solid #fff; outline-offset: 1px; }
    .btn-login { min-height: 50px; margin-top: 0.25rem; border: 0; border-radius: 10px; background: #FDF8F4; color: #2D2420; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
    .btn-login:hover { background: #fff; }
    .btn-login:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    .btn-login:disabled { opacity: 0.7; cursor: wait; }
    .unavailable { margin: 0.5rem 0 0; font-size: 1rem; line-height: 1.5; }
    .error { margin: 0; padding: 0.6rem 0.8rem; border-radius: 8px; background: rgba(255,255,255,0.94); color: #9B2C2C; font-size: 0.875rem; }
    @media (prefers-reduced-motion: reduce) { .entry { animation: none; } }
  `]
})
export class GalleryLoginComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  password = '';
  pin = '';
  title = '';
  coverUrl = '';
  focalPoint = '50% 50%';
  error = signal('');
  loading = signal(false);
  /** Mensaje cuando la galería no se puede abrir: en ese caso no se ofrece un acceso inútil. */
  unavailable = signal<string | null>(null);

  slug = '';

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    // Load gallery info (cover + title)
    this.http.get<GalleryInfoResponse>(`${environment.apiUrl}/gallery/${this.slug}`).subscribe({
      next: (data) => { this.title = galleryDisplayTitle(data); this.coverUrl = data.coverUrl; this.focalPoint = `${data.coverFocalPoint?.x ?? 50}% ${data.coverFocalPoint?.y ?? 50}%`; },
      error: (e) => this.unavailable.set(galleryAccessMessage(e?.status ?? 0)),
    });
  }

  login() {
    if (!this.password || !this.pin) { this.error.set('Ingresa contraseña y PIN'); return; }
    this.loading.set(true);
    this.error.set('');
    this.http.post<GalleryAuthResponse>(`${environment.apiUrl}/gallery/${this.slug}/auth`, { password: this.password, pin: this.pin }).subscribe({
      next: (res) => {
        sessionStorage.setItem(`gallery_token_${this.slug}`, res.token);
        sessionStorage.setItem(`gallery_data_${this.slug}`, JSON.stringify(res.gallery));
        this.router.navigate(['/galeria', this.slug, 'ver']);
      },
      error: (e) => { this.error.set(e.error?.message || 'Error de autenticación'); this.loading.set(false); }
    });
  }
}
