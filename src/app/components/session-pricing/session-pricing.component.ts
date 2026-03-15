import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-session-pricing',
  standalone: true,
  templateUrl: './session-pricing.component.html',
  styleUrl: './session-pricing.component.scss'
})
export class SessionPricingComponent implements OnInit, OnDestroy {
  readonly phrases = ['Asegura tu lugar', 'Un regalo para mamá', 'Agenda tu sesión'];

  typedText = '';

  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.tick();
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  private tick(): void {
    const current = this.phrases[this.phraseIndex];

    if (this.isDeleting) {
      this.charIndex--;
      this.typedText = current.slice(0, this.charIndex);
    } else {
      this.charIndex++;
      this.typedText = current.slice(0, this.charIndex);
    }

    let delay = this.isDeleting ? 55 : 95;

    if (!this.isDeleting && this.charIndex === current.length) {
      delay = 2200;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
      delay = 450;
    }

    this.timer = setTimeout(() => this.tick(), delay);
  }
}
