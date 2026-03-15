import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {
  isLoading = true;
  showFlash = false;

  ngOnInit() {
    // D dibuja: 0–2.6s · L dibuja: 0.8–3.4s · pausa visible: 3.4–4.2s
    setTimeout(() => {
      this.showFlash = true;       // dispara fade-out CSS
      setTimeout(() => {
        this.isLoading = false;    // elimina el nodo del DOM
      }, 500);
    }, 4200);
  }
}
