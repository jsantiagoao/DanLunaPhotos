import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gallery" [class.dark]="design.theme === 'dark'" (contextmenu)="$event.preventDefault()">
      <!-- Cover Full Screen -->
      <div class="cover-fullscreen" [style.background-image]="'url(' + coverUrl + ')'" [style.background-position]="focalPoint">
        <div class="cover-fs-overlay">
          <div class="cover-logo-icon">
            <img src="assets/images/logo-light.png" alt="Dan Luna" class="cover-logo-img" />
          </div>
          <div class="cover-brand">DAN LUNA PHOTOS</div>
          <h1 class="cover-title" [class]="'title-' + design.typography">{{ gallery.title }}</h1>
          <p class="cover-date">{{ gallery.date || '' }}</p>
          <button class="cover-enter-btn" (click)="scrollToGallery()">VER GALERÍA</button>
        </div>
      </div>

      <!-- Sticky nav bar -->
      <div class="gallery-nav" id="gallery-nav">
        <div class="nav-title">{{ gallery.title }}</div>
        <div class="nav-sets">
          @for (s of gallery.sets; track s) {
            <button [class.active]="activeSet === s" (click)="activeSet = s">{{ s }}</button>
          }
        </div>
        <div class="nav-actions">
          <button class="na-btn" [class.active]="showFavoritesOnly" (click)="showFavoritesOnly = !showFavoritesOnly" title="Favoritas">♥</button>
          <button class="na-btn" (click)="downloadAll()" title="Descargar">⬇</button>
          <button class="na-btn" (click)="startSlideshow()" title="Slideshow">▶</button>
        </div>
      </div>

      <!-- Grid -->
      <div class="photo-grid" [class]="'layout-' + design.gridLayout + ' spacing-' + design.spacing">
        @for (p of displayedPhotos(); track p._id) {
          <div class="photo-item" (click)="openLightbox(p)">
            <img [src]="p.thumbUrl" [alt]="p.filename" loading="lazy" />
            <button class="fav-btn" [class.active]="p.isFavorite" (click)="toggleFav(p); $event.stopPropagation()">♥</button>
            <input type="checkbox" class="select-check" [checked]="selectedIds.includes(p._id)" (click)="toggleSelect(p._id); $event.stopPropagation()" />
          </div>
        }
      </div>

      @if (selectedIds.length) {
        <div class="selection-bar">
          <span>{{ selectedIds.length }} seleccionadas</span>
          <button (click)="downloadSelected()">⬇ Descargar selección</button>
          <button (click)="selectedIds = []">✕</button>
        </div>
      }

      <!-- Lightbox -->
      @if (lightboxPhoto()) {
        <div class="lightbox" (click)="lightboxPhoto.set(null)">
          <div class="lb-content" (click)="$event.stopPropagation()">
            <img class="lb-thumb" [src]="lightboxPhoto().thumbUrl" [class.loaded]="lightboxWebLoaded" />
            <img class="lb-web" [src]="lightboxPhoto().webUrl || lightboxPhoto().thumbUrl" (load)="lightboxWebLoaded = true" [class.loaded]="lightboxWebLoaded" />
            <div class="lb-actions">
              <button (click)="prevPhoto()">‹</button>
              <button class="fav-btn-lb" [class.active]="lightboxPhoto().isFavorite" (click)="toggleFav(lightboxPhoto())">♥</button>
              @if (gallery.downloads?.enabled) {
                <a [href]="lightboxPhoto().originalUrl" download class="dl-btn">⬇</a>
              }
              <button (click)="nextPhoto()">›</button>
            </div>
            <button class="lb-close" (click)="lightboxPhoto.set(null)">✕</button>
          </div>
        </div>
      }

      <!-- Slideshow -->
      @if (slideshowActive) {
        <div class="slideshow" (click)="slideshowActive = false">
          <img [src]="slideshowPhotos[slideshowIndex]?.thumbUrl" />
          <div class="slideshow-controls" (click)="$event.stopPropagation()">
            <button (click)="slideshowPrev()">‹</button>
            <button (click)="slideshowActive = false">✕</button>
            <button (click)="slideshowNext()">›</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .gallery { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #fff; }
    .gallery.dark { background: #1a1a1a; color: #f0f0f0; }

    /* Cover Full Screen */
    .cover-fullscreen { height: 100vh; background-size: cover; position: relative; display: flex; align-items: center; justify-content: center; }
    .cover-fullscreen::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.35); }
    .cover-fs-overlay { text-align: center; color: #fff; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
    .cover-logo-icon { margin-bottom: 0.5rem; }
    .cover-logo-img { width: 50px; height: 50px; object-fit: contain; opacity: 0.9; }
    .cover-brand { font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; opacity: 0.85; margin-bottom: 3rem; font-weight: 300; }
    .cover-title { margin: 0; letter-spacing: 6px; text-transform: uppercase; text-shadow: 0 2px 20px rgba(0,0,0,0.3); }
    .cover-title.title-serif { font-family: 'Fraunces', serif; font-size: 3.5rem; font-weight: 300; }
    .cover-title.title-sans { font-family: 'DM Sans', sans-serif; font-size: 3rem; font-weight: 200; }
    .cover-date { font-size: 0.75rem; letter-spacing: 3px; opacity: 0.7; margin-top: 1rem; text-transform: uppercase; }
    .cover-enter-btn { margin-top: 4rem; background: none; border: none; color: #fff; font-size: 0.7rem; letter-spacing: 4px; text-transform: uppercase; cursor: pointer; padding: 1rem 2rem; border-top: 1px solid rgba(255,255,255,0.3); transition: all 0.3s; }
    .cover-enter-btn:hover { border-top-color: #fff; letter-spacing: 5px; }

    /* Sticky nav bar */
    .gallery-nav { display: flex; align-items: center; padding: 1rem 2rem; border-bottom: 1px solid #EAE7E1; position: sticky; top: 0; background: #fff; z-index: 50; }
    .dark .gallery-nav { background: #1a1a1a; border-color: #333; }
    .nav-title { font-family: 'Fraunces', serif; font-size: 0.9rem; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: #2D2420; min-width: 160px; white-space: nowrap; }
    .dark .nav-title { color: #f0f0f0; }
    .nav-sets { flex: 1; display: flex; gap: 1.5rem; justify-content: center; overflow-x: auto; }
    .nav-sets button { background: none; border: none; font-size: 0.8rem; color: #666; cursor: pointer; padding: 0.5rem 0; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
    .nav-sets button.active { color: #2D2420; border-bottom-color: #2D2420; font-weight: 500; }
    .dark .nav-sets button { color: #999; }
    .dark .nav-sets button.active { color: #fff; border-bottom-color: #fff; }
    .nav-actions { display: flex; gap: 0.5rem; min-width: 140px; justify-content: flex-end; }
    .na-btn { background: none; border: 1px solid #EAE7E1; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: #666; }
    .na-btn:hover { border-color: #2D2420; color: #2D2420; }
    .na-btn.active { background: #2D2420; color: #fff; border-color: #2D2420; }
    .dark .na-btn { border-color: #444; color: #ccc; }

    /* Photo grid */
    .photo-grid { padding: 2rem; }
    .layout-masonry { column-count: 3; column-gap: 8px; }
    .layout-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 8px; }
    .layout-horizontal { display: flex; flex-wrap: wrap; gap: 8px; }
    .layout-horizontal .photo-item { height: 250px; flex-grow: 1; }
    .layout-horizontal .photo-item img { height: 100%; width: 100%; object-fit: cover; }
    .spacing-compact { gap: 4px; column-gap: 4px; }
    .spacing-normal { gap: 8px; column-gap: 8px; }
    .spacing-wide { gap: 16px; column-gap: 16px; }

    .photo-item { position: relative; break-inside: avoid; margin-bottom: 8px; cursor: pointer; border-radius: 2px; overflow: hidden; }
    .photo-item img { width: 100%; display: block; transition: transform 0.3s; }
    .photo-item:hover img { transform: scale(1.02); }
    .fav-btn { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.4); border: none; color: #fff; font-size: 1.2rem; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
    .photo-item:hover .fav-btn { opacity: 1; }
    .fav-btn.active { opacity: 1; color: #e74c3c; background: rgba(255,255,255,0.9); }
    .select-check { position: absolute; top: 8px; left: 8px; width: 18px; height: 18px; cursor: pointer; opacity: 0; transition: opacity 0.2s; accent-color: #AD8A6A; }
    .photo-item:hover .select-check { opacity: 1; }
    .select-check:checked { opacity: 1; }

    /* Selection bar */
    .selection-bar { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #2D2420; color: #fff; padding: 0.75rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; box-shadow: 0 8px 30px rgba(0,0,0,0.2); z-index: 100; }
    .selection-bar button { background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }

    /* Lightbox */
    .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
    .lb-content { position: relative; max-width: 90vw; max-height: 90vh; }
    .lb-content .lb-thumb { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 2px; position: absolute; inset: 0; filter: blur(8px); transition: opacity 0.3s; }
    .lb-content .lb-thumb.loaded { opacity: 0; pointer-events: none; }
    .lb-content .lb-web { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 2px; opacity: 0; transition: opacity 0.3s; }
    .lb-content .lb-web.loaded { opacity: 1; }
    .lb-actions { position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; align-items: center; }
    .lb-actions button, .lb-actions a { background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 1.5rem; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; text-decoration: none; }
    .lb-actions button:hover, .lb-actions a:hover { background: rgba(255,255,255,0.2); }
    .fav-btn-lb.active { color: #e74c3c; }
    .lb-close { position: absolute; top: -40px; right: 0; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; }

    /* Slideshow */
    .slideshow { position: fixed; inset: 0; background: #000; z-index: 2000; display: flex; align-items: center; justify-content: center; }
    .slideshow img { max-width: 95vw; max-height: 90vh; object-fit: contain; animation: fadeIn 0.5s; }
    .slideshow-controls { position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; }
    .slideshow-controls button { background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 1.5rem; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Mobile */
    @media (max-width: 768px) {
      .layout-masonry { column-count: 2; }
      .layout-grid { grid-template-columns: repeat(2, 1fr); }
      .layout-horizontal .photo-item { height: 180px; }
      .cover-fullscreen { height: 100svh; }
      .cover-title.title-serif { font-size: 2rem; letter-spacing: 4px; }
      .cover-title.title-sans { font-size: 1.8rem; }
      .gallery-nav { flex-wrap: wrap; padding: 0.75rem 1rem; gap: 0.5rem; }
      .nav-title { min-width: auto; width: 100%; text-align: center; font-size: 0.8rem; }
      .nav-sets { width: 100%; justify-content: center; gap: 0.75rem; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 0.25rem; }
      .nav-actions { width: 100%; justify-content: center; }
      .photo-grid { padding: 0.5rem; }
      .lb-content img { max-width: 95vw; max-height: 75vh; }
      .selection-bar { bottom: 1rem; padding: 0.6rem 1rem; font-size: 0.8rem; }
    }
  `]
})
export class GalleryViewComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  slug = '';
  token = '';
  gallery: any = { title: '', sets: [], downloads: { enabled: true } };
  design: any = { theme: 'light', gridLayout: 'masonry', typography: 'serif', spacing: 'normal', coverStyle: 'full-width' };
  coverUrl = '';
  focalPoint = '50% 50%';
  photos = signal<any[]>([]);
  lightboxPhoto = signal<any>(null);
  activeSet = '';
  selectedIds: string[] = [];
  showFavoritesOnly = false;
  slideshowActive = false;
  slideshowPhotos: any[] = [];
  slideshowIndex = 0;
  lightboxWebLoaded = false;
  private slideshowInterval: any;

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    this.token = sessionStorage.getItem(`gallery_token_${this.slug}`) || '';
    const data = sessionStorage.getItem(`gallery_data_${this.slug}`);

    if (!this.token || !data) {
      this.router.navigate(['/galeria', this.slug]);
      return;
    }

    this.gallery = JSON.parse(data);
    this.design = this.gallery.design || this.design;
    this.coverUrl = this.gallery.coverUrl || '';
    this.focalPoint = `${this.gallery.coverFocalPoint?.x || 50}% ${this.gallery.coverFocalPoint?.y || 50}%`;
    this.activeSet = this.gallery.sets?.[0] || '';

    this.loadPhotos();
    this.trackView();
  }

  scrollToGallery() {
    document.getElementById('gallery-nav')?.scrollIntoView({ behavior: 'smooth' });
  }

  loadPhotos() {
    const headers = new HttpHeaders({ 'X-Gallery-Token': this.token });
    this.http.get<any[]>(`${environment.apiUrl}/gallery/${this.slug}/photos`, { headers }).subscribe({
      next: (photos) => this.photos.set(photos),
      error: () => this.router.navigate(['/galeria', this.slug])
    });
  }

  displayedPhotos(): any[] {
    let list = this.photos();
    if (this.activeSet) list = list.filter(p => p.set === this.activeSet);
    if (this.showFavoritesOnly) list = list.filter(p => p.isFavorite);
    return list;
  }

  filteredPhotos(): any[] { return this.displayedPhotos(); }

  startSlideshow() {
    this.slideshowPhotos = this.displayedPhotos();
    this.slideshowIndex = 0;
    this.slideshowActive = true;
    this.slideshowInterval = setInterval(() => this.slideshowNext(), 4000);
  }

  slideshowNext() {
    this.slideshowIndex = (this.slideshowIndex + 1) % this.slideshowPhotos.length;
  }

  slideshowPrev() {
    this.slideshowIndex = this.slideshowIndex === 0 ? this.slideshowPhotos.length - 1 : this.slideshowIndex - 1;
  }

  openLightbox(photo: any) { this.lightboxWebLoaded = false; this.lightboxPhoto.set(photo); }

  prevPhoto() {
    const list = this.filteredPhotos();
    const idx = list.findIndex(p => p._id === this.lightboxPhoto()?._id);
    if (idx > 0) { this.lightboxWebLoaded = false; this.lightboxPhoto.set(list[idx - 1]); }
  }

  nextPhoto() {
    const list = this.filteredPhotos();
    const idx = list.findIndex(p => p._id === this.lightboxPhoto()?._id);
    if (idx < list.length - 1) { this.lightboxWebLoaded = false; this.lightboxPhoto.set(list[idx + 1]); }
  }

  toggleFav(photo: any) {
    const headers = new HttpHeaders({ 'X-Gallery-Token': this.token });
    this.http.post<any>(`${environment.apiUrl}/gallery/${this.slug}/favorite`, { photoId: photo._id }, { headers }).subscribe(res => {
      photo.isFavorite = res.favorite;
      this.photos.set([...this.photos()]);
      if (this.lightboxPhoto()?._id === photo._id) this.lightboxPhoto.set({ ...photo });
    });
  }

  downloadAll() {
    this.http.post<any>(`${environment.apiUrl}/gallery/${this.slug}/download`, {}).subscribe({
      next: (res) => { window.open(res.downloadUrl, '_blank'); },
      error: () => alert('Error al generar descarga')
    });
  }

  trackView() {
    this.http.post(`${environment.apiUrl}/gallery/${this.slug}/view`, {}).subscribe();
  }

  toggleSelect(id: string) {
    const idx = this.selectedIds.indexOf(id);
    if (idx > -1) this.selectedIds.splice(idx, 1);
    else this.selectedIds.push(id);
  }

  downloadSelected() {
    if (!this.selectedIds.length) return;
    this.http.post<any>(`${environment.apiUrl}/gallery/${this.slug}/download`, { photoIds: this.selectedIds }).subscribe({
      next: (res) => { window.open(res.downloadUrl, '_blank'); },
      error: () => alert('Error al generar descarga')
    });
  }
}
