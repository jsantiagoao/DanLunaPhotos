import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { WhatsappFloatComponent } from './components/atoms/whatsapp-float/whatsapp-float.component';
import { ScrollToTopComponent } from './components/atoms/scroll-to-top/scroll-to-top.component';
// ChatbotComponent está desactivado a proposito (ver template). Para reactivarlo:
// 1) importar ChatbotComponent aqui y agregarlo a `imports`
// 2) descomentar <app-chatbot /> dentro del @if
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WhatsappFloatComponent, ScrollToTopComponent],
  template: `
    <router-outlet></router-outlet>
    <app-scroll-to-top />
    @if (!hideChatbot) { <!-- <app-chatbot /> --> }
    <app-whatsapp-float />
  `,
  styles: []
})
export class AppComponent {
  hideChatbot = false;

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.hideChatbot = e.urlAfterRedirects === '/cotizacion-bodas';
    });
  }
}
