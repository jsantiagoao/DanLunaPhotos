import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { AboutComponent } from '../../components/about/about.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    LoaderComponent,
    HeroComponent,
    GalleryComponent,
    AboutComponent,
    TestimonialsComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <app-loader />
    <app-navbar />
    <main>
      <app-hero id="inicio" />
      <app-gallery id="portfolio" />
      <app-about id="sobre-mi" />
      <app-testimonials id="testimonios" />
      <app-contact id="contacto" />
    </main>
    <app-footer />
  `,
  styles: [`
    main { display: block; }
  `]
})
export class HomeComponent {}
