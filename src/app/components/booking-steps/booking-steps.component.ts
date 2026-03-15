import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BookingStep {
  number: string;
  title: string;
  contentLines: string[];
  button?: {
    text: string;
    url: string;
  };
}

@Component({
  selector: 'app-booking-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-steps.component.html',
  styleUrl: './booking-steps.component.scss'
})
export class BookingStepsComponent {
  activeStep = signal(0); // Paso 0 abierto por defecto

  readonly steps: BookingStep[] = [
    {
      number: '01',
      title: 'Selecciona tu fecha disponible',
      contentLines: [
        'Revisa la disponibilidad en el calendario y elige la fecha y hora de tu sesión fotográfica.',
        '¿No encuentras un horario disponible? Escríbenos por WhatsApp al +52 56 6770 4976 y coordinamos un espacio para ti.'
      ],
      button: {
        text: 'Ver fechas disponibles',
        url: 'https://danlunaphotos.pixieset.com/booking/prueba-calendario'
      }
    },
    {
      number: '02',
      title: 'Realiza el pago del anticipo',
      contentLines: [
        'Para apartar tu fecha, realiza el pago del 50% de anticipo, el resto se liquida el día de la sesión fotográfica.',
        'Banco: HSBC',
        'TDB: 4309 6750 0041 9647',
        'CLABE: 021180066217305101',
        'Titular: Daniela Luna López'
      ]
    },
    {
      number: '03',
      title: 'Confirma y finaliza tu reserva',
      contentLines: [
        'Para finalizar, envía por WhatsApp el comprobante de pago del 50% de anticipo. Recuerda que el resto se liquida el día de la sesión fotográfica.',
        '¡Listo! Tu sesión será agendada'
      ],
      button: {
        text: 'Enviar comprobante',
        url: 'https://wa.me/525667704976?text=Hola%20acabo%20de%20reservar%20una%20fecha%20para%20una%20sesi%C3%B3n%20del%20d%C3%ADa%20de%20las%20madres,%20quiero%20confirmar%20mi%20sesi%C3%B3n%20fotogr%C3%A1fica.'
      }
    }
  ];

  toggleStep(index: number): void {
    // Si está abierto, ciérralo; si está cerrado, abrelo
    this.activeStep.set(this.activeStep() === index ? -1 : index);
  }

  isStepOpen(index: number): boolean {
    return this.activeStep() === index;
  }
}
