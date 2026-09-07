import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Configuracion adicional para el renderizado en servidor (build-time prerender).
 * Se fusiona con appConfig: en el servidor Angular ejecuta los componentes y
 * hornea el HTML —incluidos los og-tags que pone SeoService— en archivos
 * estaticos por ruta. El cliente luego hidrata ese HTML.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
