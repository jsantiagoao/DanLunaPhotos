import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SessionInclude {
  icon: string;
  title: string;
  description?: string;
}

@Component({
  selector: 'app-what-includes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './what-includes.component.html',
  styleUrl: './what-includes.component.scss'
})
export class WhatIncludesComponent {
  readonly includes: SessionInclude[] = [
    {
      icon: '✓',
      title: '40 minutos de sesión en nuestro set'
    },
    {
      icon: '✓',
      title: '25 a 30 fotografías digitales en alta calidad con edición una a una'
    },
    {
      icon: '✓',
      title: 'Hasta 5 personas por sesión (persona extra: $250 c/u)'
    },
    {
      icon: '✓',
      title: 'Entrega de 6 a 8 días hábiles'
    },
    {
      icon: '✓',
      title: 'Opción a dos cambios de ropa'
    },
    {
      icon: '✓',
      title: 'Link de outfits propuesta'
    }
  ];
}
