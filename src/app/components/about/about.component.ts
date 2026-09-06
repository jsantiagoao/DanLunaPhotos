import { Component } from '@angular/core';
import { AppImageComponent } from '../../shared/ui/app-image/app-image.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, AppImageComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {}
