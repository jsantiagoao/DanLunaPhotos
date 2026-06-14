import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([
    { role: 'bot', text: '¡Hola! Soy Luna Bot 📷 ¿En qué puedo ayudarte? Pregúntame sobre sesiones, paquetes o disponibilidad.' }
  ]);
  inputText = '';
  loading = signal(false);
  private sessionId = crypto.randomUUID();
  private apiUrl = 'https://iv28brdvae.execute-api.us-east-1.amazonaws.com/prod/chat';
  private shouldScroll = false;

  constructor(private http: HttpClient) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.loading()) return;

    this.messages.update(m => [...m, { role: 'user', text }]);
    this.inputText = '';
    this.loading.set(true);
    this.shouldScroll = true;

    this.http.post<{ reply: string }>(this.apiUrl, {
      message: text,
      sessionId: this.sessionId
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.typeMessage(res.reply);
      },
      error: () => {
        this.loading.set(false);
        this.messages.update(m => [...m, { role: 'bot', text: 'Disculpa, hubo un error. Contáctanos por WhatsApp al +52 56 6770 4976' }]);
        this.shouldScroll = true;
      }
    });
  }

  private typeMessage(fullText: string): void {
    this.messages.update(m => [...m, { role: 'bot', text: '' }]);
    const idx = this.messages().length - 1;
    let charIdx = 0;
    const speed = 15; // ms por caracter

    const interval = setInterval(() => {
      charIdx += 2;
      const partial = fullText.slice(0, charIdx);
      this.messages.update(m => {
        const updated = [...m];
        updated[idx] = { ...updated[idx], text: partial };
        return updated;
      });
      this.shouldScroll = true;

      if (charIdx >= fullText.length) {
        clearInterval(interval);
      }
    }, speed);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  formatMessage(text: string): string {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Lines starting with - or * or • → list items
    const lines = html.split('\n');
    let result = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[-*•]\s/.test(trimmed)) {
        if (!inList) { result += '<ul>'; inList = true; }
        result += `<li>${trimmed.replace(/^[-*•]\s+/, '')}</li>`;
      } else if (/^\d+[.)]\s/.test(trimmed)) {
        if (!inList) { result += '<ol>'; inList = true; }
        result += `<li>${trimmed.replace(/^\d+[.)]\s+/, '')}</li>`;
      } else {
        if (inList) { result += inList ? '</ul>' : '</ol>'; inList = false; }
        result += trimmed ? `<p>${trimmed}</p>` : '';
      }
    }
    if (inList) result += '</ul>';

    return result;
  }
}
