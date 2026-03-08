import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoaderComponent } from '../loader/loader.component';
import { FooterComponent } from '../footer/footer.component';
import { MothersDayContentComponent } from '../mothers-day-content/mothers-day-content.component';
import { BreadcrumbItem } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-mothers-day',
  standalone: true,
  imports: [
    NavbarComponent,
    LoaderComponent,
    FooterComponent,
    MothersDayContentComponent
  ],
  template: `
    <app-loader />
    <app-navbar />
    <main class="mothers-day-page">
      <app-mothers-day-content [breadcrumbs]="breadcrumbs" />
    </main>
    <app-footer />
  `,
  styles: [`
    main { display: block; }
  `]
})
export class MothersDayComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '#' },
    { label: 'Sesiones al Aire Libre', href: '/#portfolio' },
    { label: 'Día de las Madres' }
  ];
}

