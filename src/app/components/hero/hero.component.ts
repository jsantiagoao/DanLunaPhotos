import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  scrollToPortfolio(): void {
    document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' });
  }
  scrollToContact(): void {
    document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
