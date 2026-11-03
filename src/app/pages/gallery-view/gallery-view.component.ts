import { Component, HostListener, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryIconComponent } from '../../components/atoms/gallery-icon/gallery-icon.component';
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
import { downloadErrorAction } from './download-error.logic';
import { coverTextPlacement, galleryDisplayTitle, gridImageUrl, photoAspectRatio, shareLink, swipeDirection } from './gallery-delivery.logic';
import { GallerySlideshow } from './gallery-slideshow';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryIconComponent],
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
  preparingDownload = false;
  readonly slideshow = new GallerySlideshow<GalleryPhoto>();
  lightboxWebLoaded = false;
  /** Aviso integrado: reemplaza a alert(), que interrumpe y se ve ajeno a la galería. */
  notice = signal<string | null>(null);
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;
  private touchStart: { x: number; y: number } | null = null;

  get displayTitle(): string {
    return galleryDisplayTitle(this.gallery);
  }

  get coverPlacement() {
    return coverTextPlacement(this.gallery.coverFocalPoint?.y);
  }

  aspectRatio(photo: GalleryPhoto): string | null {
    return photoAspectRatio(photo, this.design.gridLayout);
  }

  gridImage(photo: GalleryPhoto): string {
    return gridImageUrl(photo, this.design.gridLayout);
  }

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
    this.slideshow.stop();
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
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

  startSlideshow() {
    this.slideshow.start(this.displayedPhotos());
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const key = event.key;
    if (this.slideshow.active) {
      if (key === 'Escape') this.slideshow.stop();
      else if (key === 'ArrowRight') this.slideshow.next();
      else if (key === 'ArrowLeft') this.slideshow.prev();
    } else if (this.lightboxPhoto()) {
      if (key === 'Escape') this.lightboxPhoto.set(null);
      else if (key === 'ArrowRight') this.nextPhoto();
      else if (key === 'ArrowLeft') this.prevPhoto();
    } else if (this.showDownloadScreen && key === 'Escape') {
      this.showDownloadScreen = false;
    }
  }

  onTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  onTouchEnd(event: TouchEvent, next: () => void, prev: () => void) {
    const touch = event.changedTouches[0];
    if (!touch || !this.touchStart) return;
    const direction = swipeDirection(touch.clientX - this.touchStart.x, touch.clientY - this.touchStart.y);
    this.touchStart = null;
    if (direction === 'next') next();
    else if (direction === 'prev') prev();
  }

  private showNotice(message: string) {
    this.notice.set(message);
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.notice.set(null), 5000);
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
    this.preparingDownload = true;
    this.api.requestDownload(this.slug, this.token, {}).subscribe({
      next: (res) => {
        this.preparingDownload = false;
        this.showDownloadScreen = false;
        if (res.downloadUrl) window.open(res.downloadUrl, '_blank');
        else this.showNotice(res.message || 'Tu descarga se está preparando.');
      },
      error: (e) => {
        this.preparingDownload = false;
        this.onDownloadError(e);
      },
    });
  }

  /** Sesión vencida → de vuelta al acceso; cualquier otro error, el mensaje del servidor. */
  private onDownloadError(e: { status?: number; error?: { message?: string } }) {
    const action = downloadErrorAction(e?.status ?? 0, e?.error?.message);
    if (action.type === 'relogin') {
      sessionStorage.removeItem(`gallery_token_${this.slug}`);
      this.router.navigate(['/galeria', this.slug]);
    } else {
      this.showNotice(action.message);
    }
  }

  async shareGallery() {
    const url = `https://danlunaphoto.com/galeria/${this.slug}`;
    // bind: share y writeText pierden su contexto si se llaman sueltos.
    const device = {
      share: navigator.share?.bind(navigator),
      clipboard: navigator.clipboard ? { writeText: navigator.clipboard.writeText.bind(navigator.clipboard) } : undefined,
    };
    const message = await shareLink(device, this.displayTitle, url);
    if (message) this.showNotice(message);
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
      error: (e) => this.onDownloadError(e),
    });
  }
}
