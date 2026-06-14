import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface Question {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'radio' | 'number';
  placeholder?: string;
  options?: string[];
  required: boolean;
}

@Component({
  selector: 'app-cotizacion-bodas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './cotizacion-bodas.component.html',
  styleUrl: './cotizacion-bodas.component.scss'
})
export class CotizacionBodasComponent {
  currentStep = signal(0);
  submitted = signal(false);
  sending = signal(false);

  answers: Record<string, string> = {};

  readonly questions: Question[] = [
    { id: 'nombres', label: 'Nombre de los novios', type: 'text', placeholder: 'Ej: María & Carlos', required: true },
    { id: 'contacto', label: '¿Cuál es tu número de WhatsApp o correo?', type: 'text', placeholder: 'Ej: 442 123 4567 o tu@email.com', required: true },
    { id: 'fecha', label: '¿En qué fecha es tu evento?', type: 'date', required: true },
    { id: 'ceremonia', label: '¿Qué tipo de ceremonia es?', type: 'radio', options: ['Iglesia', 'Civil', 'Simbólica', 'Iglesia y Civil'], required: true },
    { id: 'invitados', label: '¿Cuántos invitados serán?', type: 'number', placeholder: 'Ej: 150', required: true },
    { id: 'lugar', label: '¿Ya tienes lugar para tu evento? ¿Dónde será?', type: 'text', placeholder: 'Ej: Hacienda San José, Querétaro', required: true },
    { id: 'arreglo', label: '¿Quisieras cobertura desde el arreglo de los novios?', type: 'radio', options: ['Solo la novia', 'Ambos novios', 'No, gracias'], required: true },
    { id: 'horas', label: '¿Cuántas horas de cobertura les gustaría?', type: 'radio', options: ['2-3 horas', '4-5 horas', '6-8 horas', 'Más de 8 horas'], required: true },
    { id: 'impresas', label: '¿Te gustaría algún paquete de fotografías impresas o fotolibro?', type: 'radio', options: ['Fotolibro premium', 'Fotografías impresas', 'Ambos', 'No por ahora'], required: true },
  ];

  constructor(private http: HttpClient, private titleService: Title) {
    this.titleService.setTitle('Cotización Bodas · Dan Luna Photo');
    this.generateCalendar();
  }

  // Calendar
  calendarDate = new Date();
  calendarDays: (number | null)[] = [];
  readonly weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  get calendarMonth(): string {
    return this.calendarDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  generateCalendar(): void {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday start
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) this.calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) this.calendarDays.push(i);
  }

  prevMonth(): void {
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDay(day: number): void {
    const y = this.calendarDate.getFullYear();
    const m = (this.calendarDate.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    this.answers[this.current.id] = `${y}-${m}-${d}`;
  }

  isSelectedDay(day: number): boolean {
    const y = this.calendarDate.getFullYear();
    const m = (this.calendarDate.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return this.answers[this.current.id] === `${y}-${m}-${d}`;
  }

  isPastDay(day: number): boolean {
    const date = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), day);
    return date < new Date(new Date().toDateString());
  }

  get selectedDateFormatted(): string {
    const val = this.answers[this.current?.id];
    if (!val) return '';
    const [y, m, d] = val.split('-');
    const date = new Date(+y, +m - 1, +d);
    return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  get current(): Question {
    return this.questions[this.currentStep()];
  }

  get progress(): number {
    return ((this.currentStep() + 1) / this.questions.length) * 100;
  }

  get canNext(): boolean {
    const answer = this.answers[this.current.id];
    return this.current.required ? !!answer && String(answer).trim().length > 0 : true;
  }

  next(): void {
    if (this.currentStep() < this.questions.length - 1 && this.canNext) {
      this.currentStep.update(s => s + 1);
    }
  }

  prev(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  goToStep(i: number): void {
    if (i <= this.currentStep()) {
      this.currentStep.set(i);
    }
  }

  selectOption(option: string): void {
    this.answers[this.current.id] = option;
  }

  submit(): void {
    if (!this.canNext) return;
    this.sending.set(true);

    this.http.post('https://iv28brdvae.execute-api.us-east-1.amazonaws.com/prod/cotizacion', {
      type: 'boda',
      answers: this.answers,
      timestamp: new Date().toISOString()
    }).subscribe({
      next: () => { this.submitted.set(true); this.sending.set(false); },
      error: () => { this.submitted.set(true); this.sending.set(false); }
    });
  }
}
