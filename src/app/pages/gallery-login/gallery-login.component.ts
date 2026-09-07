import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GalleryInfoResponse, GalleryAuthResponse } from '../gallery-view/gallery.models';

@Component({
  selector: 'app-gallery-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gallery-login" [style.background-image]="coverUrl ? 'url(' + coverUrl + ')' : ''">
      <div class="overlay">
        <div class="login-card">
          <h1>{{ title || 'Galería' }}</h1>
          <p>Ingresa tus credenciales para ver las fotos</p>
          <div class="field"><input type="password" [(ngModel)]="password" placeholder="Contraseña" (keydown.enter)="login()" /></div>
          <div class="field"><input type="text" [(ngModel)]="pin" placeholder="PIN" maxlength="6" (keydown.enter)="login()" /></div>
          @if (error()) { <p class="error">{{ error() }}</p> }
          <button class="btn-login" (click)="login()" [disabled]="loading()">{{ loading() ? 'Verificando...' : 'Entrar' }}</button>
          <span class="brand">Dan Luna Photo</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-login { min-height: 100vh; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
    .overlay { background: rgba(0,0,0,0.5); min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .login-card { background: #fff; border-radius: 16px; padding: 3rem 2.5rem; width: 90%; max-width: 380px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    h1 { font-family: 'Fraunces', serif; color: #2D2420; font-size: 1.8rem; margin: 0 0 0.5rem; }
    p { color: #666; font-size: 0.9rem; margin: 0 0 1.5rem; }
    .field { margin-bottom: 1rem; }
    .field input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #EAE7E1; border-radius: 8px; font-size: 1rem; text-align: center; box-sizing: border-box; }
    .field input:focus { outline: none; border-color: #AD8A6A; }
    .btn-login { width: 100%; background: #AD8A6A; color: #fff; border: none; padding: 0.85rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-login:hover { background: #2D2420; }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #dc3545; font-size: 0.85rem; margin: 0 0 1rem; }
    .brand { display: block; margin-top: 2rem; font-family: 'Fraunces', serif; color: #AD8A6A; font-size: 0.9rem; }
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
  error = signal('');
  loading = signal(false);

  slug = '';

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    // Load gallery info (cover + title)
    this.http.get<GalleryInfoResponse>(`${environment.apiUrl}/gallery/${this.slug}`).subscribe({
      next: (data) => { this.title = data.title; this.coverUrl = data.coverUrl; },
      error: () => {}
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
