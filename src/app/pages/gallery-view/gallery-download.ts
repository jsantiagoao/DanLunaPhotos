import { downloadErrorAction } from './download-error.logic';
import { DownloadJob } from './gallery.models';

/**
 * Descarga ZIP en segundo plano, sin Angular (máquina de estados, ADR-004 de LambdasDL).
 *
 * El servidor arma el archivo y aquí se consulta el avance. La clienta puede seguir viendo
 * la galería o recargar: el trabajo se retoma con el id guardado en la sesión.
 */
export const DOWNLOAD_POLL_MS = 2000;
const MAX_NETWORK_FAILURES = 5;
const CONNECTION_LOST = 'Se perdió la conexión mientras preparábamos tu descarga. Inténtalo de nuevo.';

export type DownloadState =
  | { kind: 'idle' }
  | { kind: 'preparing'; processed: number; total: number }
  | { kind: 'ready'; skipped: number }
  | { kind: 'failed'; message: string };

export interface DownloadPort {
  start(photoIds?: string[]): Promise<DownloadJob>;
  check(jobId: string): Promise<DownloadJob>;
}

type JobStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
interface RequestError { status?: number; error?: { message?: string } }

export class GalleryDownload {
  state: DownloadState = { kind: 'idle' };
  private jobId: string | null = null;
  private selection?: string[];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private networkFailures = 0;
  private stopped = false;

  constructor(
    private readonly port: DownloadPort,
    private readonly storage: JobStorage,
    slug: string,
    private readonly onSessionExpired: () => void,
    private readonly navigate: (url: string) => void,
  ) {
    this.storageKey = `gallery_zip_${slug}`;
  }

  private readonly storageKey: string;

  async start(photoIds?: string[]): Promise<void> {
    this.selection = photoIds;
    this.clearTimer();
    this.stopped = false;
    this.networkFailures = 0;
    try {
      this.apply(await this.port.start(photoIds));
    } catch (error) {
      this.onRequestError(error as RequestError);
    }
  }

  retry(): Promise<void> {
    return this.start(this.selection);
  }

  /** Retoma lo que estaba en curso antes de recargar. Si ya no existe, no hay nada que avisar. */
  async resume(): Promise<void> {
    const saved = this.storage.getItem(this.storageKey);
    if (!saved) return;
    this.jobId = saved;
    try {
      this.apply(await this.port.check(saved));
    } catch (error) {
      if ((error as RequestError).status === 401) this.onRequestError(error as RequestError);
      else this.dismiss();
    }
  }

  /** Pide la URL en el momento del clic: la anterior pudo vencer mientras la clienta veía fotos. */
  async save(): Promise<void> {
    if (!this.jobId) return;
    try {
      const job = await this.port.check(this.jobId);
      this.apply(job);
      if (job.downloadUrl) this.navigate(job.downloadUrl);
    } catch (error) {
      this.onRequestError(error as RequestError);
    }
  }

  dismiss(): void {
    this.clearTimer();
    this.jobId = null;
    this.storage.removeItem(this.storageKey);
    this.state = { kind: 'idle' };
  }

  /** La página se cierra: deja de consultar, pero el id sigue guardado para retomar. */
  stop(): void {
    this.stopped = true;
    this.clearTimer();
  }

  private apply(job: DownloadJob): void {
    if (this.stopped) return;
    this.networkFailures = 0;
    this.jobId = job.jobId;
    if (job.status === 'ready') {
      this.storage.setItem(this.storageKey, job.jobId);
      this.state = { kind: 'ready', skipped: job.skipped };
    } else if (job.status === 'failed') {
      this.storage.removeItem(this.storageKey);
      this.state = { kind: 'failed', message: job.message || CONNECTION_LOST };
    } else {
      this.storage.setItem(this.storageKey, job.jobId);
      this.state = { kind: 'preparing', processed: job.processed, total: job.total };
      this.schedulePoll();
    }
  }

  private schedulePoll(): void {
    this.clearTimer();
    this.timer = setTimeout(() => void this.poll(), DOWNLOAD_POLL_MS);
  }

  private async poll(): Promise<void> {
    this.timer = null;
    try {
      this.apply(await this.port.check(this.jobId as string));
    } catch (error) {
      if (this.stopped) return;
      const { status } = error as RequestError;
      // Sin respuesta o error del servidor: el trabajo sigue vivo, un corte breve no lo cancela.
      if ((!status || status >= 500) && ++this.networkFailures < MAX_NETWORK_FAILURES) this.schedulePoll();
      else if (!status || status >= 500) this.fail(CONNECTION_LOST);
      else this.onRequestError(error as RequestError);
    }
  }

  private onRequestError(error: RequestError): void {
    const action = downloadErrorAction(error?.status ?? 0, error?.error?.message);
    if (action.type === 'relogin') {
      this.dismiss();
      this.onSessionExpired();
    } else {
      this.fail(action.message);
    }
  }

  private fail(message: string): void {
    this.clearTimer();
    this.storage.removeItem(this.storageKey);
    this.state = { kind: 'failed', message };
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
