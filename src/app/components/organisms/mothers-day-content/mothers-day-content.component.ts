import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AppImageComponent } from '../../../shared/ui/app-image/app-image.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../atoms/breadcrumb/breadcrumb.component';
import { WhatIncludesComponent } from '../../molecules/what-includes/what-includes.component';
import { BookingStepsComponent } from '../../molecules/booking-steps/booking-steps.component';
import { SessionPricingComponent } from '../../molecules/session-pricing/session-pricing.component';

@Component({
  selector: 'app-mothers-day-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreadcrumbComponent,
    WhatIncludesComponent,
    BookingStepsComponent,
    SessionPricingComponent,
    AppImageComponent
  ],
  templateUrl: './mothers-day-content.component.html',
  styleUrl: './mothers-day-content.component.scss'
})
export class MothersDayContentComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}
