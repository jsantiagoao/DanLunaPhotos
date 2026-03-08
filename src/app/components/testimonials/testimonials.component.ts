import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Testimonial {
  stars: string;
  quote: string;
  name: string;
  type: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  readonly testimonials: Testimonial[] = [
    {
      stars: '★★★★★',
      quote: '"Dan captó exactamente lo que quería. Fue una experiencia increíble, las fotos superaron todas mis expectativas."',
      name: 'María G.',
      type: 'Sesión Retratos'
    },
    {
      stars: '★★★★★',
      quote: '"Nuestras fotos de boda son simplemente mágicas. Dan tiene ojo para los momentos únicos. ¡Los recomendamos al 100%!"',
      name: 'Lucía y Tomás R.',
      type: 'Boda — Nov. 2024'
    },
    {
      stars: '★★★★★',
      quote: '"Nunca me había sentido tan cómodo frente a una cámara. El resultado es increíble. Definitivamente repetiré."',
      name: 'Carlos M.',
      type: 'Sesión personal urbana'
    }
  ];
}
