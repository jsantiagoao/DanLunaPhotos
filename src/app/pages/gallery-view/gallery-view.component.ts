import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GalleryApiService } from './gallery-api.service';
import {
  Gallery,
  GalleryDesign,
  GalleryPhoto,
  DEFAULT_DESIGN,
} from './gallery.models';
import { filterPhotos, neighbourPhoto } from './gallery-filter.logic';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery-view.component.html',
  styleUrl: './gallery-view.component.scss',
})
export class GalleryViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(GalleryApiService);

  slug = '';
  token = '';
  gallery: Gallery = { title: '', sets: [], downloads: { enabled: true } };
  design: GalleryDesign = DEFAULT_DESIGN;
  coverUrl = '';
  focalPoint = '50% 50%';
  photos = signal<GalleryPhoto[]>([]);
  lightboxPhoto = signal<GalleryPhoto | null>(null);
  activeSet = '';
  selectedIds: string[] = [];
  showFavoritesOnly = false;
  showDownloadScreen = false;
  downloadEmail = '';
  downloadPin = '';
  slideshowActive = false;
  slideshowPhotos: GalleryPhoto[] = [];
  slideshowIndex = 0;
  lightboxWebLoaded = false;
  private slideshowInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    this.token = sessionStorage.getItem(`gallery_token_${this.slug}`) || '';
    const data = sessionStorage.getItem(`gallery_data_${this.slug}`);

    if (!this.token || !data) {
      this.router.navigate(['/galeria', this.slug]);
      return;
    }

    this.gallery = JSON.parse(data);
    this.design = this.gallery.design || DEFAULT_DESIGN;
    this.coverUrl = this.gallery.coverUrl || '';
    this.focalPoint = `${this.gallery.coverFocalPoint?.x ?? 50}% ${this.gallery.coverFocalPoint?.y ?? 50}%`;
    this.activeSet = this.gallery.sets?.[0] || '';

    this.loadPhotos();
    this.api.trackView(this.slug).subscribe();
  }

  ngOnDestroy() {
    if (this.slideshowInterval) clearInterval(this.slideshowInterval);
  }

  scrollToGallery() {
    document.getElementById('gallery-nav')?.scrollIntoView({ behavior: 'smooth' });
  }

  loadPhotos() {
    this.api.loadPhotos(this.slug, this.token).subscribe({
      next: (photos) => this.photos.set(photos),
      error: () => this.router.navigate(['/galeria', this.slug]),
    });
  }

  displayedPhotos(): GalleryPhoto[] {
    return filterPhotos(this.photos(), this.activeSet, this.showFavoritesOnly);
  }

  /** Foto actual del slideshow. Puede ser undefined si la lista esta vacia o el
      indice se salio de rango; el tipo lo refleja para forzar acceso seguro. */
  get currentSlideshowPhoto(): GalleryPhoto | undefined {
    return this.slideshowPhotos[this.slideshowIndex];
  }

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

  openLightbox(photo: GalleryPhoto) {
    this.lightboxWebLoaded = false;
    this.lightboxPhoto.set(photo);
  }

  prevPhoto() {
    const prev = neighbourPhoto(this.displayedPhotos(), this.lightboxPhoto()?._id, -1);
    if (prev) {
      this.lightboxWebLoaded = false;
      this.lightboxPhoto.set(prev);
    }
  }

  nextPhoto() {
    const next = neighbourPhoto(this.displayedPhotos(), this.lightboxPhoto()?._id, 1);
    if (next) {
      this.lightboxWebLoaded = false;
      this.lightboxPhoto.set(next);
    }
  }

  toggleFav(photo: GalleryPhoto) {
    this.api.toggleFavorite(this.slug, this.token, photo._id).subscribe((res) => {
      photo.isFavorite = res.favorite;
      this.photos.set([...this.photos()]);
      if (this.lightboxPhoto()?._id === photo._id) this.lightboxPhoto.set({ ...photo });
    });
  }

  downloadAll() {
    this.showDownloadScreen = true;
  }

  confirmDownload() {
    if (!this.downloadEmail) return;
    this.api.requestDownload(this.slug, this.token, { email: this.downloadEmail }).subscribe({
      next: (res) => {
        this.showDownloadScreen = false;
        if (res.downloadUrl) window.open(res.downloadUrl, '_blank');
        else alert(res.message || 'Tu descarga se está preparando.');
      },
      error: () => alert('Error al generar descarga'),
    });
  }

  shareGallery() {
    const url = `https://danlunaphoto.com/galeria/${this.slug}`;
    if (navigator.share) {
      navigator.share({ title: this.gallery.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado');
    }
  }

  toggleSelect(id: string) {
    const idx = this.selectedIds.indexOf(id);
    if (idx > -1) this.selectedIds.splice(idx, 1);
    else this.selectedIds.push(id);
  }

  downloadSelected() {
    if (!this.selectedIds.length) return;
    this.api.requestDownload(this.slug, this.token, { photoIds: this.selectedIds }).subscribe({
      next: (res) => {
        if (res.downloadUrl) window.open(res.downloadUrl, '_blank');
      },
      error: () => alert('Error al generar descarga'),
    });
  }
}
