import { Component, Input } from '@angular/core';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';
import { MothersDayCarouselComponent } from '../mothers-day-carousel/mothers-day-carousel.component';
import { WhatIncludesComponent } from '../what-includes/what-includes.component';
import { BookingStepsComponent } from '../booking-steps/booking-steps.component';
import { CalendarPickerComponent } from '../calendar-picker/calendar-picker.component';

@Component({
  selector: 'app-mothers-day-content',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MothersDayCarouselComponent,
    WhatIncludesComponent,
    BookingStepsComponent,
    CalendarPickerComponent
  ],
  templateUrl: './mothers-day-content.component.html',
  styleUrl: './mothers-day-content.component.scss'
})
export class MothersDayContentComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}
