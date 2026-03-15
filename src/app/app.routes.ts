import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MothersDayComponent } from './components/mothers-day/mothers-day.component';
import { FotografaEnQueretaroComponent } from './pages/fotografa-en-queretaro/fotografa-en-queretaro.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dia-de-las-madres', component: MothersDayComponent },
  { path: 'fotografa-en-queretaro', component: FotografaEnQueretaroComponent },
  { path: '**', redirectTo: '' }
];
