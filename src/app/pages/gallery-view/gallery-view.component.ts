import { Component, HostListener, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
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
import { GalleryDownload } from './gallery-download';
import { galleryDisplayTitle, gridImageUrl, photoAspectRatio, resolveDesign, shareLink, swipeDirection, withPublishedInfo } from './gallery-delivery.logic';
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
  download!: GalleryDownload;
  readonly slideshow = new GallerySlideshow<GalleryPhoto>();
  lightboxWebLoaded = false;
  /** Aviso integrado: reemplaza a alert(), que interrumpe y se ve ajeno a la galería. */
  notice = signal<string | null>(null);
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;
  private touchStart: { x: number; y: number } | null = null;

  get displayTitle(): string {
    return galleryDisplayTitle(this.gallery);
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

    this.showGallery(JSON.parse(data));
    this.activeSet = this.gallery.sets?.[0] || '';
    this.download = this.createDownload();
    void this.download.resume();

    this.loadPhotos();
    this.refreshPublishedInfo();
    this.api.trackView(this.slug).subscribe();
  }

  private showGallery(gallery: Gallery) {
    this.gallery = gallery;
    this.design = resolveDesign(gallery.design);
    this.coverUrl = gallery.coverUrl || '';
    this.focalPoint = `${gallery.coverFocalPoint?.x ?? 50}% ${gallery.coverFocalPoint?.y ?? 50}%`;
  }

  /** Si esto falla se queda lo guardado: quién decide si puede seguir viendo es loadPhotos. */
  private refreshPublishedInfo() {
    this.api.loadInfo(this.slug).subscribe({
      next: (info) => {
        const gallery = withPublishedInfo(this.gallery, info);
        this.showGallery(gallery);
        sessionStorage.setItem(`gallery_data_${this.slug}`, JSON.stringify(gallery));
      },
      error: () => undefined,
    });
  }

  ngOnDestroy() {
    this.slideshow.stop();
    this.download?.stop();
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

  private createDownload(): GalleryDownload {
    return new GalleryDownload(
      {
        start: (photoIds) => firstValueFrom(this.api.requestDownload(this.slug, this.token, photoIds ? { photoIds } : {})),
        check: (jobId) => firstValueFrom(this.api.checkDownload(this.slug, this.token, jobId)),
      },
      sessionStorage,
      this.slug,
      () => {
        sessionStorage.removeItem(`gallery_token_${this.slug}`);
        this.router.navigate(['/galeria', this.slug]);
      },
      // La URL trae Content-Disposition: attachment, así que el navegador descarga sin salir de la galería.
      (url) => window.location.assign(url),
    );
  }

  get downloadLabel(): string {
    const state = this.download?.state;
    if (state?.kind !== 'preparing') return '';
    return state.processed ? `${state.processed} de ${state.total} fotos` : 'Empezando…';
  }

  get skippedPhotos(): number {
    const state = this.download?.state;
    return state?.kind === 'ready' ? state.skipped : 0;
  }

  get skippedLabel(): string {
    return this.skippedPhotos === 1
      ? 'Una foto no se pudo incluir. Escríbele a tu fotógrafa para recibirla.'
      : `${this.skippedPhotos} fotos no se pudieron incluir. Escríbele a tu fotógrafa para recibirlas.`;
  }

  get downloadError(): string {
    const state = this.download?.state;
    return state?.kind === 'failed' ? state.message : '';
  }

  get downloadPercent(): number {
    const state = this.download?.state;
    return state?.kind === 'preparing' && state.total ? Math.round((state.processed / state.total) * 100) : 0;
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
    void this.download.start([...this.selectedIds]);
  }
}
