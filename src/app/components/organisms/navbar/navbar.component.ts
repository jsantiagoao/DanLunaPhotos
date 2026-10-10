import { Component, ElementRef, HostListener, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAIN_MENU } from './navbar-menu';
import { whatsappUrl } from '../../../shared/contact-info';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  menuOpen = signal(false);
  activeSubmenu = signal<string | null>(null);

  readonly links = MAIN_MENU;
  readonly bookingUrl = whatsappUrl('Hola, me gustaría reservar una sesión fotográfica. ¿Podrían darme más información?');

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

  /** Cierra el menú (y su bloqueo de scroll) sin navegar: enlaces externos a WhatsApp. */
  closeMenu(): void {
    this.menuOpen.set(false);
    this.activeSubmenu.set(null);
    document.body.classList.remove('menu-open');
  }

  /** En móvil, tocar fuera del navbar cierra el menú. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen() || this.activeSubmenu()) this.closeMenu();
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
