import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CITY, CONTACT_EMAIL, INSTAGRAM_HANDLE, WHATSAPP_DISPLAY,
} from '../../shared/contact-info';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  sent = false;
  sending = false;
  sendError = false;
  captchaError = false;
  captchaQuestion = '';
  captchaAnswer = 0;

  form = this.fb.group({
    nombre:  ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    tipo:    [''],
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
    captcha: ['', [Validators.required]]
  });

  readonly sessionTypes = [
    'Día de las Madres',
    'Sesion al Aire Libre',
    'Evento/Celebracion',
    'Comercial',
    'Otro'
  ];

  readonly infoItems = [
    { label: 'WhatsApp',   value: WHATSAPP_DISPLAY  },
    { label: 'Email',      value: CONTACT_EMAIL     },
    { label: 'Instagram',  value: INSTAGRAM_HANDLE  },
    { label: 'Ciudad',     value: CITY              }
  ];

  /** Para el enlace de rescate cuando falla el envio. */
  readonly whatsappDisplay = WHATSAPP_DISPLAY;

  constructor() {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    this.captchaQuestion = `¿Cuánto es ${num1} + ${num2}?`;
    this.captchaAnswer = num1 + num2;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const captchaValue = parseInt(this.form.get('captcha')?.value || '0');
    if (captchaValue !== this.captchaAnswer) {
      // Antes esto era un alert(): rompe el flujo y en movil tapa el formulario.
      this.captchaError = true;
      this.generateCaptcha();
      this.form.patchValue({ captcha: '' });
      return;
    }

    this.captchaError = false;
    this.sendError = false;
    this.sending = true;

    this.http.post(`${environment.apiUrl}/contacto`, this.form.value).subscribe({
      next: () => {
        this.sending = false;
        this.sent = true;
        this.form.reset();
        this.generateCaptcha();
      },
      error: () => {
        // No se limpia el formulario: si el envio fallo, lo que escribio el
        // visitante es lo unico que queda para reintentar o pasarlo a WhatsApp.
        this.sending = false;
        this.sendError = true;
      }
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
