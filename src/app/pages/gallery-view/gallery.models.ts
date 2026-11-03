/**
 * Modelos del visor de galeria de clientes.
 *
 * Reemplazan los `any` que habia en gallery-view. Tipar el contrato con el
 * backend evita errores silenciosos y documenta la forma de los datos.
 * Alineados con el backend (DanLunaStudio): Gallery, Photo, design.
 */

export type GalleryTheme = 'light' | 'dark';
export type GridLayout = 'masonry' | 'grid' | 'horizontal' | 'single';
export type Typography = 'serif' | 'sans' | 'modern' | 'timeless' | 'bold' | 'subtle';
export type Spacing = 'compact' | 'normal' | 'wide';
/** Catálogo de Studio. Las galerías viejas traen 'full-width': se ve como 'centro'. */
export type CoverStyle = 'centro' | 'izquierda' | 'novela' | 'vintage' | 'marco' | 'raya' | 'divisor' | 'diario' | 'sello' | 'contorno' | 'full-width';

export interface GalleryDesign {
  theme: GalleryTheme;
  gridLayout: GridLayout;
  typography: Typography;
  spacing: Spacing;
  coverStyle: CoverStyle;
  highlightColor?: string;
  displayName?: string;
}

export interface FocalPoint {
  x: number;
  y: number;
}

export interface GalleryPhoto {
  _id: string;
  filename: string;
  thumbUrl: string;
  webUrl?: string;
  originalUrl?: string;
  set?: string;
  isFavorite?: boolean;
  width?: number;
  height?: number;
}

export interface Gallery {
  title: string;
  date?: string;
  sets: string[];
  coverUrl?: string;
  coverFocalPoint?: FocalPoint;
  design?: Partial<GalleryDesign>;
  downloads?: { enabled: boolean };
}

export const DEFAULT_DESIGN: GalleryDesign = {
  theme: 'light',
  gridLayout: 'masonry',
  typography: 'serif',
  spacing: 'normal',
  coverStyle: 'centro',
};

/** Respuestas del backend. */
export interface FavoriteResponse {
  favorite: boolean;
}

export interface DownloadJob {
  jobId: string;
  status: 'pending' | 'building' | 'ready' | 'failed';
  processed: number;
  total: number;
  skipped: number;
  downloadUrl?: string;
  message?: string;
}

/** Info publica de la portada (antes de autenticar). */
export interface GalleryInfoResponse {
  title: string;
  coverUrl: string;
  coverFocalPoint?: FocalPoint;
  design?: Partial<GalleryDesign>;
}

/** Respuesta de autenticacion del visor: token + datos de la galeria. */
export interface GalleryAuthResponse {
  token: string;
  gallery: Gallery;
}
