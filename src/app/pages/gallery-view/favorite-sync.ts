/**
 * Favoritas con actualización optimista y "gana la última intención", sin Angular.
 *
 * Es la estrategia de los botones de "me gusta" (Instagram, Pixieset, Pic-Time):
 * - El corazón cambia al instante; no espera al servidor (que puede tardar segundos
 *   en un arranque en frío, y era cuando la clienta volvía a tocar).
 * - Una sola petición en camino por foto. Los toques que llegan mientras tanto solo
 *   cambian la intención; al responder, se envía una vez más si la intención final
 *   difiere de lo guardado. Cinco toques seguidos son, como mucho, dos peticiones.
 * - Se envía el estado deseado, no "alternar": repetir una petición no invierte nada.
 * - Si el servidor falla se vuelve a lo último guardado y se avisa.
 */
export interface FavoritePort {
  /** Guarda el estado y devuelve el que quedó en el servidor. */
  save(photoId: string, favorite: boolean): Promise<boolean>;
}

export const FAVORITE_ERROR = 'No pudimos guardar tu favorita. Revisa tu conexión e inténtalo de nuevo.';

export class FavoriteSync {
  /** Lo que el servidor confirmó por última vez, por foto con cambios en curso. */
  private readonly saved = new Map<string, boolean>();
  /** Lo que la clienta quiere ahora. */
  private readonly wanted = new Map<string, boolean>();
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly port: FavoritePort,
    private readonly show: (photoId: string, favorite: boolean) => void,
    private readonly warn: (message: string) => void,
  ) {}

  /** `current` es lo que se ve en pantalla cuando no hay nada pendiente para esa foto. */
  toggle(photoId: string, current: boolean): void {
    if (!this.saved.has(photoId)) this.saved.set(photoId, current);
    const next = !(this.wanted.get(photoId) ?? current);
    this.wanted.set(photoId, next);
    this.show(photoId, next);
    void this.flush(photoId);
  }

  isPending(photoId: string): boolean {
    return this.inFlight.has(photoId) || this.wanted.has(photoId);
  }

  private async flush(photoId: string): Promise<void> {
    if (this.inFlight.has(photoId)) return;
    this.inFlight.add(photoId);
    try {
      while (this.wanted.get(photoId) !== this.saved.get(photoId)) {
        const target = this.wanted.get(photoId)!;
        const result = await this.port.save(photoId, target);
        this.saved.set(photoId, result);
        // El servidor manda: si guardó otro estado del pedido, no se insiste (evita un ciclo).
        if (result !== target) break;
      }
      this.show(photoId, this.saved.get(photoId)!);
    } catch {
      this.show(photoId, this.saved.get(photoId)!);
      this.warn(FAVORITE_ERROR);
    } finally {
      this.inFlight.delete(photoId);
      this.saved.delete(photoId);
      this.wanted.delete(photoId);
    }
  }
}
