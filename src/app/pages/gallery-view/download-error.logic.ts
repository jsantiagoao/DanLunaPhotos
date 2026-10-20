/**
 * Qué hacer cuando falla una descarga de la galería (ADR-003 de LambdasDL).
 * La sesión del cliente vence a las 12 h o al cambiar la contraseña/PIN: en ese caso
 * se le regresa al acceso en lugar de mostrar un error genérico.
 */
export type DownloadErrorAction = { type: 'relogin' } | { type: 'alert'; message: string };

const GENERIC = 'No se pudo generar la descarga. Inténtalo de nuevo.';

export function downloadErrorAction(status: number, serverMessage?: string): DownloadErrorAction {
  if (status === 401) return { type: 'relogin' };
  return { type: 'alert', message: serverMessage || GENERIC };
}
