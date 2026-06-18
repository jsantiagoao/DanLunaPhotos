export interface BusySlot {
  date: string;
  time: string | null;
  type: 'session' | 'blocked';
}

export interface AvailabilityResponse {
  month: number;
  year: number;
  busySlots: BusySlot[];
}

export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  type: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

export interface BookingResponse {
  message: string;
  sessionId: string;
  date: string;
  time: string;
}
