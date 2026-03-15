import { Component, OnInit } from '@angular/core';

import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-fotografa-en-queretaro',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, BreadcrumbComponent],
  templateUrl: './fotografa-en-queretaro.component.html',
  styleUrl: './fotografa-en-queretaro.component.scss'
})
export class FotografaEnQueretaroComponent implements OnInit {

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Fotógrafa en Querétaro' }
  ];

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Daniela Luna · Fotógrafa Profesional en Querétaro | Dan Luna Photo');

    this.meta.updateTag({
      name: 'description',
      content:
        'Soy Daniela Luna, fotógrafa profesional en Querétaro con base en arquitectura y narrativa visual. ' +
        'Retratos, familias y sesiones especiales con intención y alma.'
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'fotógrafa profesional querétaro, Daniela Luna fotógrafa, fotografía de retrato querétaro, ' +
        'fotografía familiar querétaro, fotógrafa arquitectura querétaro, Dan Luna Photo'
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title',       content: 'Daniela Luna · Fotógrafa en Querétaro | Dan Luna Photo' });
    this.meta.updateTag({ property: 'og:description', content: 'Fotografía con arquitectura y alma. Daniela Luna — fotógrafa profesional en Querétaro.' });
    this.meta.updateTag({ property: 'og:url',         content: 'https://danlunaphotos.com/fotografa-en-queretaro' });
    this.meta.updateTag({ property: 'og:image',       content: 'https://danlunaphotos.com/assets/images/Daniela_Luna_Fotografa-1024x776.jpg' });
  }
}
