import { Component, Input } from '@angular/core';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';
import { WhatIncludesComponent } from '../what-includes/what-includes.component';
import { BookingStepsComponent } from '../booking-steps/booking-steps.component';
import { SessionPricingComponent } from '../session-pricing/session-pricing.component';

@Component({
  selector: 'app-mothers-day-content',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    WhatIncludesComponent,
    BookingStepsComponent,
    SessionPricingComponent
  ],
  templateUrl: './mothers-day-content.component.html',
  styleUrl: './mothers-day-content.component.scss'
})
export class MothersDayContentComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}
