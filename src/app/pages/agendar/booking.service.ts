import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvailabilityResponse, BookingRequest, BookingResponse } from './booking.models';
import { SessionTypeConfig } from './session-types.config';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}/booking`;

  constructor(private http: HttpClient) {}

  getAvailability(month: number, year: number, campaignType?: string): Observable<AvailabilityResponse> {
    const params: Record<string, string> = { month: month.toString(), year: year.toString() };
    // ADR-007: la landing de una campaña pide el estado de SU campaña por slug.
    if (campaignType) params['type'] = campaignType;
    return this.http.get<AvailabilityResponse>(`${this.baseUrl}/availability`, { params });
  }

  /** Tipos de sesion y paquetes desde el backend (fallback: SESSION_TYPES local). */
  getSessionTypes(): Observable<SessionTypeConfig[]> {
    return this.http.get<SessionTypeConfig[]>(`${environment.apiUrl}/packages`);
  }

  reserve(data: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/reserve`, data);
  }
}
