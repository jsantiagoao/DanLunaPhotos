/**
 * Modelos del visor de galeria de clientes.
 *
 * Reemplazan los `any` que habia en gallery-view. Tipar el contrato con el
 * backend evita errores silenciosos y documenta la forma de los datos.
 * Alineados con el backend (DanLunaStudio): Gallery, Photo, design.
 */

export type GalleryTheme = 'light' | 'dark';
export type GridLayout = 'masonry' | 'grid' | 'horizontal';
export type Typography = 'serif' | 'sans';
export type Spacing = 'compact' | 'normal' | 'wide';
export type CoverStyle = 'full-width' | 'centered' | 'split';

export interface GalleryDesign {
  theme: GalleryTheme;
  gridLayout: GridLayout;
  typography: Typography;
  spacing: Spacing;
  coverStyle: CoverStyle;
  highlightColor?: string;
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
}

export interface Gallery {
  title: string;
  date?: string;
  sets: string[];
  coverUrl?: string;
  coverFocalPoint?: FocalPoint;
  design?: GalleryDesign;
  downloads?: { enabled: boolean };
}

export const DEFAULT_DESIGN: GalleryDesign = {
  theme: 'light',
  gridLayout: 'masonry',
  typography: 'serif',
  spacing: 'normal',
  coverStyle: 'full-width',
};

/** Respuestas del backend. */
export interface FavoriteResponse {
  favorite: boolean;
}

export interface DownloadResponse {
  downloadUrl?: string;
  message?: string;
}

/** Info publica de la portada (antes de autenticar). */
export interface GalleryInfoResponse {
  title: string;
  coverUrl: string;
}

/** Respuesta de autenticacion del visor: token + datos de la galeria. */
export interface GalleryAuthResponse {
  token: string;
  gallery: Gallery;
}
