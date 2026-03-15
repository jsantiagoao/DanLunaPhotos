import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-float.component.html',
  styleUrl: './whatsapp-float.component.scss'
})
export class WhatsappFloatComponent {
  isOpen = false;

  readonly waUrl =
    'https://wa.me/525667704976?text=Hola%2C%20vi%20la%20promoci%C3%B3n%20del%20D%C3%ADa%20de%20las%20Madres.%20%C2%BFMe%20das%20m%C3%A1s%20detalles%2C%20por%20favor%3F';

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
