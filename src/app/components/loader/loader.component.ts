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
    setTimeout(() => {
      this.showFlash = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }, 2500);
  }
}
