import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MagneticDirective } from '../../../shared/motion/magnetic.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective],
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
