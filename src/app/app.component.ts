import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { WhatsappFloatComponent } from './components/whatsapp-float/whatsapp-float.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WhatsappFloatComponent, ScrollToTopComponent, ChatbotComponent],
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
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.hideChatbot = e.urlAfterRedirects === '/cotizacion-bodas';
    });
  }
}
