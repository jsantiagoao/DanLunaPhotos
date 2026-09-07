import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
