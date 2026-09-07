import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';

registerLocaleData(localeEs);

/** Bootstrap usado por el prerender en build time. Recibe el BootstrapContext
    que Angular 19 exige en servidor para localizar la plataforma. */
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
