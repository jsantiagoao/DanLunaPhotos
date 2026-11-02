import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { WhatsappFloatComponent } from './components/atoms/whatsapp-float/whatsapp-float.component';
import { ScrollToTopComponent } from './components/atoms/scroll-to-top/scroll-to-top.component';
// ChatbotComponent está desactivado a proposito (ver template). Para reactivarlo:
// 1) importar ChatbotComponent aqui y agregarlo a `imports`
// 2) descomentar <app-chatbot /> dentro del @if
import { filter } from 'rxjs';
import { isClientGalleryUrl } from './pages/gallery-view/gallery-delivery.logic';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WhatsappFloatComponent, ScrollToTopComponent],
  template: `
    <router-outlet></router-outlet>
    @if (!isClientGallery) {
      <app-scroll-to-top />
      @if (!hideChatbot) { <!-- <app-chatbot /> --> }
      <app-whatsapp-float />
    }
  `,
  styles: []
})
export class AppComponent {
  hideChatbot = false;
  isClientGallery = false;

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.hideChatbot = e.urlAfterRedirects === '/cotizacion-bodas';
      this.isClientGallery = isClientGalleryUrl(e.urlAfterRedirects);
    });
  }
}
