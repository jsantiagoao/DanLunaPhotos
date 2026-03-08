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
      title: 'Sesión de 20 a 30 minutos'
    },
    {
      icon: '✓',
      title: 'Tres cambios de ropa'
    },
    {
      icon: '✓',
      title: 'Tres fotografías digitales'
    },
    {
      icon: '✓',
      title: 'Tres fotografías impresas en alta resolución'
    },
    {
      icon: '✓',
      title: 'Un link de descarga'
    },
    {
      icon: '✓',
      title: 'Entrega express 24–48 horas'
    }
  ];
}
