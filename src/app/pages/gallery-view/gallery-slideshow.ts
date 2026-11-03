/**
 * Presentación automática de la galería, sin Angular.
 *
 * Es dueña de su temporizador: antes vivía en el componente, nadie lo detenía al
 * cerrar y cada apertura sumaba uno más, así que las fotos pasaban cada vez más rápido.
 */
export const SLIDESHOW_INTERVAL_MS = 4000;

export class GallerySlideshow<T> {
  private items: readonly T[] = [];
  private index = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  get active(): boolean {
    return this.timer !== null;
  }

  get current(): T | undefined {
    return this.items[this.index];
  }

  start(items: readonly T[]): void {
    this.stop();
    if (!items.length) return;
    this.items = items;
    this.index = 0;
    this.timer = setInterval(() => this.next(), SLIDESHOW_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }

  next(): void {
    if (this.items.length) this.index = (this.index + 1) % this.items.length;
  }

  prev(): void {
    if (this.items.length) this.index = (this.index - 1 + this.items.length) % this.items.length;
  }
}
