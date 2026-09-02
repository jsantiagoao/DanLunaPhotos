import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BookingService } from '../agendar/booking.service';
import { ChristmasCalendarComponent } from './christmas-calendar.component';
import {
  APARTADO_AMOUNT, CAMPAIGN_NAME, CAMPAIGN_SUBTITLE, CHRISTMAS_INCLUDES, LOCATION,
} from './christmas-includes.data';
import {
  EXTRA_PERSON_PRICE, MAX_AFORO, MAX_PERSONAS, MAX_PERSONAS_EXTRA, PET_SIZES,
  emptyChristmasForm, humanDate, humanSlot, priceChangeNotice, sessionTotal, toBookingRequest,
  validateChristmasForm, whatsappConfirmUrl, type ChristmasForm,
} from './christmas-booking.logic';
import { SESSION_MINUTES, type BusyInterval } from './christmas-slots';
import type { CampaignStatus } from '../agendar/booking.models';

/**
 * Pagina: reserva de las mini sesiones navideñas.
 *
 * Tres pasos: que incluye, elegir dia y hora, tus datos. Se reserva con el mismo
 * endpoint que las demas sesiones (`POST /booking/reserve`, tipo `navidad`) porque
 * comparten coleccion — ver ADR-001.
 *
 * La pagina orquesta; las reglas viven en `christmas-booking.logic.ts` y
 * `christmas-slots.ts`, que se prueban sin renderizar nada.
 */
@Component({
  selector: 'app-navidad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, NavbarComponent, FooterComponent, ChristmasCalendarComponent],
  templateUrl: './navidad.component.html',
  styleUrl: './navidad.component.scss',
})
export class NavidadComponent implements OnInit {
  private readonly booking = inject(BookingService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly step = signal<'detalle' | 'agenda' | 'datos' | 'listo'>('detalle');
  protected readonly loading = signal(false);
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly intervals = signal<BusyInterval[]>([]);
  /** Precio vigente y lugares de preventa; lo publica el backend con la agenda. */
  protected readonly campaign = signal<CampaignStatus | null>(null);

  protected readonly month = signal(new Date().getMonth() + 1);
  protected readonly year = signal(new Date().getFullYear());

  protected form: ChristmasForm = emptyChristmasForm();
  /** Trampa para robots: una persona no llena un campo que no ve. */
  protected honeypot = '';

  protected readonly includes = CHRISTMAS_INCLUDES;
  protected readonly campaignName = CAMPAIGN_NAME;
  protected readonly campaignSubtitle = CAMPAIGN_SUBTITLE;
  protected readonly location = LOCATION;
  protected readonly sessionMinutes = SESSION_MINUTES;
  /** El del backend manda; el local es el respaldo si la llamada falla. */
  protected readonly apartado = computed(() => this.campaign()?.apartado ?? APARTADO_AMOUNT);
  protected readonly personasOptions = Array.from({ length: MAX_PERSONAS }, (_, i) => i + 1);
  protected readonly extraOptions = Array.from({ length: MAX_PERSONAS_EXTRA + 1 }, (_, i) => i);
  protected readonly extraPrice = EXTRA_PERSON_PRICE;
  protected readonly aforo = MAX_AFORO;
  protected readonly petSizes = PET_SIZES;

  /** '2026-09-24' -> '24 de septiembre', para el aviso de preventa. */
  protected readonly preventaHasta = computed(() => humanDate(this.campaign()?.preventaEndsOn || ''));

  /**
   * Lo que va a costar la sesion con lo elegido hasta ahora.
   *
   * Es un getter y no un `computed` porque el formulario es un objeto plano ligado con
   * `ngModel`: cada cambio dispara deteccion en el componente y esto se recalcula. El
   * backend vuelve a calcularlo al reservar; esto es para que la clienta lo vea antes.
   */
  protected get totalEstimado(): number {
    return sessionTotal(this.campaign()?.price ?? 0, this.form);
  }

  protected readonly resumen = computed(() => ({
    fecha: humanDate(this.form.date),
    horario: humanSlot(this.form.time),
  }));

  ngOnInit(): void {
    this.title.setTitle(`${CAMPAIGN_NAME} · ${CAMPAIGN_SUBTITLE} | Dan Luna Photo`);
    this.meta.updateTag({
      name: 'description',
      content:
        'Mini sesiones navideñas en Querétaro: 40 minutos en set navideño, 45 fotografías ' +
        'editadas, hasta 5 personas y pet friendly. Aparta tu lugar con $500.',
    });
    this.loadAvailability();
  }

  // ── Paso 1 → 2 ──────────────────────────────────────────────
  protected irAAgenda(): void {
    this.step.set('agenda');
  }

  private loadAvailability(): void {
    this.loading.set(true);
    this.booking.getAvailability(this.month(), this.year()).subscribe({
      next: (res) => {
        this.intervals.set(res.intervals ?? []);
        if (res.campaign) this.campaign.set(res.campaign);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar la disponibilidad. Vuelve a intentarlo.');
        this.loading.set(false);
      },
    });
  }

  protected cambiarMes(delta: number): void {
    const next = this.month() + delta;
    if (next < 1) { this.month.set(12); this.year.set(this.year() - 1); }
    else if (next > 12) { this.month.set(1); this.year.set(this.year() + 1); }
    else { this.month.set(next); }
    this.form.date = '';
    this.form.time = '';
    this.loadAvailability();
  }

  protected elegirDia(dateKey: string): void {
    this.form.date = dateKey;
    this.form.time = '';
  }

  protected elegirHora(time: string): void {
    this.form.time = time;
  }

  protected get puedeContinuar(): boolean {
    return !!this.form.date && !!this.form.time;
  }

  // ── Paso 2 → 3 ──────────────────────────────────────────────
  protected irADatos(): void {
    if (this.puedeContinuar) this.step.set('datos');
  }

  protected responderMascota(lleva: boolean): void {
    this.form.mascota = lleva;
    if (!lleva) {
      // Lo que se descarta no se guarda: un nombre que quedo escrito se leeria
      // el dia de la sesion como que si trae mascota.
      this.form.mascotaTamano = '';
      this.form.mascotaNombre = '';
    }
  }

  protected reservar(): void {
    if (this.honeypot) return;

    const problema = validateChristmasForm(this.form);
    if (problema) { this.error.set(problema); return; }

    this.error.set(null);
    this.sending.set(true);

    // La preventa puede agotarse mientras la clienta llena el formulario. Antes de enviar
    // se revalida el precio contra el backend: si subio, se le avisa el nuevo precio y NO
    // se manda todavia — al confirmar de nuevo, el precio ya coincide y procede.
    const precioVisto = this.campaign()?.price ?? null;
    this.booking.getAvailability(this.month(), this.year()).subscribe({
      next: (res) => {
        if (res.campaign) this.campaign.set(res.campaign);
        this.intervals.set(res.intervals ?? []);
        const aviso = priceChangeNotice(precioVisto, res.campaign ?? null);
        if (aviso) {
          this.sending.set(false);
          this.error.set(aviso);
          return;
        }
        this.enviarReserva();
      },
      error: () => this.enviarReserva(),  // si no se pudo revalidar, el backend cobra lo correcto
    });
  }

  private enviarReserva(): void {
    this.sending.set(true);
    this.booking.reserve(toBookingRequest(this.form)).subscribe({
      next: () => { this.sending.set(false); this.step.set('listo'); },
      error: (e) => {
        this.sending.set(false);
        this.error.set(e?.error?.message || 'No pudimos apartar tu lugar. Intenta de nuevo.');
        // Un 409 significa que alguien mas se adelanto: hay que volver a la agenda.
        if (e?.status === 409) { this.step.set('agenda'); this.loadAvailability(); }
      },
    });
  }

  // ── Confirmacion ────────────────────────────────────────────
  protected get whatsappUrl(): string {
    return whatsappConfirmUrl(this.form);
  }

  protected volver(paso: 'detalle' | 'agenda'): void {
    this.error.set(null);
    this.step.set(paso);
  }
}
