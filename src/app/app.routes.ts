import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MothersDayComponent } from './components/mothers-day/mothers-day.component';
import { FotografaEnQueretaroComponent } from './pages/fotografa-en-queretaro/fotografa-en-queretaro.component';
import { BautizosComponent } from './pages/bautizos/bautizos.component';
import { CotizacionBodasComponent } from './pages/cotizacion-bodas/cotizacion-bodas.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'fotografia-bautizo-queretaro', component: BautizosComponent },
  { path: 'cotizacion-bodas', component: CotizacionBodasComponent },
  { path: 'fotografa-en-queretaro', component: FotografaEnQueretaroComponent },
  // Oculta del menú pero accesible por URL directa (no eliminada)
  { path: 'dia-de-las-madres', component: MothersDayComponent },
  { path: '**', redirectTo: '' }
];
