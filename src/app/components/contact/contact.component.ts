import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);

  sent = false;
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
    { label: 'WhatsApp',   value: '+52 56 6770 4976'   },
    { label: 'Email',      value: 'hola@danlunaphoto.duodigitalservice.com' },
    { label: 'Instagram',  value: '@danlunaphoto'         },
    { label: 'Ciudad',     value: 'Querétaro, México' }
  ];

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
    if (this.form.valid) {
      const captchaValue = parseInt(this.form.get('captcha')?.value || '0');
      if (captchaValue !== this.captchaAnswer) {
        alert('Respuesta incorrecta del captcha. Inténtalo de nuevo.');
        this.generateCaptcha();
        this.form.patchValue({ captcha: '' });
        return;
      }
      console.log('Form submitted:', this.form.value);
      this.sent = true;
      this.form.reset();
      this.generateCaptcha();
    } else {
      this.form.markAllAsTouched();
    }
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
