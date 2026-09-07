import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-session-pricing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './session-pricing.component.html',
  styleUrl: './session-pricing.component.scss'
})
export class SessionPricingComponent implements OnInit, OnDestroy {
  readonly phrases = ['Asegura tu lugar', 'Un regalo para mamá', 'Agenda tu sesión'];

  readonly typedText = signal('');

  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    // El typewriter (setTimeout recursivo) solo corre en el navegador; en
    // prerender colgaria la estabilizacion. En server queda el texto vacio.
    if (this.isBrowser) this.tick();
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  private tick(): void {
    const current = this.phrases[this.phraseIndex];

    if (this.isDeleting) {
      this.charIndex--;
      this.typedText.set(current.slice(0, this.charIndex));
    } else {
      this.charIndex++;
      this.typedText.set(current.slice(0, this.charIndex));
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
