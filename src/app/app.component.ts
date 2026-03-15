import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WhatsappFloatComponent } from './components/whatsapp-float/whatsapp-float.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WhatsappFloatComponent, ScrollToTopComponent],
  template: `
    <router-outlet></router-outlet>
    <app-scroll-to-top />
    <app-whatsapp-float />
  `,
  styles: []
})
export class AppComponent {}
