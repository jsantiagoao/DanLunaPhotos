import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { whatsappUrl } from '../../../shared/contact-info';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './whatsapp-float.component.html',
  styleUrl: './whatsapp-float.component.scss'
})
export class WhatsappFloatComponent {
  isOpen = false;

  /** Mensaje general: el botón vive en todo el sitio, no debe anunciar una campaña. */
  readonly waUrl = whatsappUrl('Hola, me gustaría información sobre una sesión fotográfica.');

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
