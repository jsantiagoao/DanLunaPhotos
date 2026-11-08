import { FavoriteSync } from './favorite-sync';
import { SingleFlight } from './single-flight';

/**
 * Acciones de la clienta sobre una foto: favorita y descarga suelta (patrón Facade).
 *
 * Reúne las dos estrategias contra clics repetidos para que el componente solo pinte:
 * - Favorita → FavoriteSync (optimista, una petición por foto, gana la última intención).
 * - Descarga → SingleFlight (una por foto a la vez; los clics de más se ignoran).
 * El acceso a la API y la navegación llegan por puertos (inversión de dependencias).
 */
export interface PhotoActionsPort {
  setFavorite(photoId: string, favorite: boolean): Promise<boolean>;
  downloadUrl(photoId: string): Promise<string>;
}

export interface PhotoActionsView {
  showFavorite(photoId: string, favorite: boolean): void;
  notice(message: string): void;
  /** Sesión vencida (401) o galería vencida (410): la pantalla de acceso explica cuál. */
  accessLost(): void;
  openFile(url: string): void;
}

export const DOWNLOAD_ERROR = 'No pudimos descargar la foto. Inténtalo de nuevo.';

const ACCESS_LOST = [401, 410];
const lostAccess = (error: unknown) => ACCESS_LOST.includes((error as { status?: number } | null)?.status ?? 0);
/** Mensaje apto para la clienta: el interceptor de errores ya lo normalizó (403 sin descargas, 404 foto borrada). */
const serverMessage = (error: unknown) => (error as { error?: { message?: string } } | null)?.error?.message || null;

export class GalleryPhotoActions {
  private readonly favorites: FavoriteSync;
  private readonly downloads = new SingleFlight();

  constructor(private readonly port: PhotoActionsPort, private readonly view: PhotoActionsView) {
    this.favorites = new FavoriteSync(
      {
        save: async (photoId, favorite) => {
          try {
            return await this.port.setFavorite(photoId, favorite);
          } catch (error) {
            if (lostAccess(error)) this.view.accessLost();
            throw error;
          }
        },
      },
      (photoId, favorite) => this.view.showFavorite(photoId, favorite),
      (message) => this.view.notice(message),
    );
  }

  toggleFavorite(photoId: string, current: boolean): void {
    this.favorites.toggle(photoId, current);
  }

  isDownloading(photoId: string): boolean {
    return this.downloads.isPending(photoId);
  }

  download(photoId: string): Promise<void> {
    return this.downloads.run(photoId, async () => {
      try {
        this.view.openFile(await this.port.downloadUrl(photoId));
      } catch (error) {
        if (lostAccess(error)) this.view.accessLost();
        else this.view.notice(serverMessage(error) ?? DOWNLOAD_ERROR);
      }
    });
  }
}
