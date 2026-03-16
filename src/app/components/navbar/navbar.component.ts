import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  href?: string;
  submenu?: { label: string; href: string }[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private router = inject(Router);
  menuOpen = signal(false);
  activeSubmenu = signal<string | null>(null);

  readonly links: MenuItem[] = [
    {
      label: 'Sesiones al Aire Libre',
      submenu: [
        { label: 'Día de las Madres', href: '/dia-de-las-madres' },
        { label: 'Día del Padre', href: '#padre-aire' },
        { label: 'En Pareja', href: '#pareja' },
        { label: 'En Familia', href: '#familia' },
        { label: 'Smash Cake', href: '#smash-cake' }
      ]
    },
    {
      label: 'Estudio Fotográfico',
      submenu: [
        { label: 'Día de las Madres', href: '/dia-de-las-madres' },
        { label: 'Navidad', href: '#navidad' }
      ]
    },
    {
      label: 'Eventos y Celebraciones',
      submenu: [
        { label: 'Bodas', href: '#bodas' },
        { label: 'Bautizos', href: '#bautizos' }
      ]
    },
    {
      label: 'Fotografía Comercial',
      submenu: [
        { label: 'Deportes', href: '#deportes' },
        { label: 'Productos', href: '#productos' },
        { label: 'Perfil Profesional', href: '#perfil' }
      ]
    },
    { label: 'Contáctame', href: '#contacto' }
  ];

  toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    document.body.classList.toggle('menu-open', next);
  }

  toggleSubmenu(label: string): void {
    this.activeSubmenu.set(this.activeSubmenu() === label ? null : label);
  }

  scrollTo(href: string | undefined): void {
    if (!href) return;
    this.menuOpen.set(false);
    this.activeSubmenu.set(null);
    document.body.classList.remove('menu-open');

    // Si es una ruta (comienza con /)
    if (href.startsWith('/')) {
      this.router.navigate([href]);
    } else if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Elemento no existe en esta página — navegar al home con el fragment
        this.router.navigate(['/'], { fragment: href.replace('#', '') });
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const w = (event.target as Window).innerWidth;
    if (w > 900 && this.menuOpen()) {
      this.menuOpen.set(false);
      document.body.classList.remove('menu-open');
    }
  }
}
