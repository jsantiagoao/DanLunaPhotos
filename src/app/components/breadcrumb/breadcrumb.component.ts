import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  private router = inject(Router);
  @Input() items: BreadcrumbItem[] = [];

  scrollTo(href: string | undefined): void {
    if (!href) return;
    // Si es una ruta (comienza con /)
    if (href.startsWith('/')) {
      this.router.navigate([href]);
    } else if (href.startsWith('#')) {
      // Si es un hash link
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
