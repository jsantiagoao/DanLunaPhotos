import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppImageComponent } from '../../../shared/ui/app-image/app-image.component';
import { RouterLink } from '@angular/router';
import { ParallaxDirective } from '../../../shared/motion/parallax.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AppImageComponent, ParallaxDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {}
