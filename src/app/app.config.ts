import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiErrorInterceptor } from './core/errors/api-error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideAnimationsAsync(),
    // withFetch: requerido para transferir el estado HTTP entre server y cliente.
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    // Hidratacion del HTML prerenderizado + replay de eventos previos a hidratar.
    provideClientHydration(withEventReplay())
  ]
};
