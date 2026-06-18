import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvailabilityResponse, BookingRequest, BookingResponse } from './booking.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}/booking`;

  constructor(private http: HttpClient) {}

  getAvailability(month: number, year: number): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.baseUrl}/availability`, {
      params: { month: month.toString(), year: year.toString() },
    });
  }

  reserve(data: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/reserve`, data);
  }
}
