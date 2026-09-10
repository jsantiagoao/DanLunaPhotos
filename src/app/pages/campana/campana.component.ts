import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../agendar/booking.service';
import type { CampaignStatus } from '../agendar/booking.models';
import {
  visibleFields, validateDynamicFields, type CampaignField,
} from './campaign-fields.logic';

/**
 * Landing genérica de una campaña (ADR-007): `/campana/:slug`.
 *
 * Una sola página para TODAS las campañas. Lee la config de la campaña desde el backend
 * (nombre, subtítulo, imagen, qué incluye, precio/preventa y `fieldSchema`) y arma el hero,
 * el detalle y el formulario de reserva con los campos declarados. Crear una campaña nueva
 * le da su landing en `/campana/<slug>` sin escribir código ni una página por campaña.
 *
 * La campaña navideña conserva su landing con arte propio en `/sesiones-navidad`; esta
 * genérica sirve a las demás campañas.
 */
@Component({
  selector: 'app-campana',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './campana.component.html',
  styleUrl: './campana.component.scss',
})
export class CampanaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly booking = inject(BookingService);

  protected readonly slug = signal('');
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly submitting = signal(false);
  protected readonly done = signal(false);

  protected readonly campaign = signal<CampaignStatus | null>(null);
  protected readonly content = signal<Record<string, any>>({});
  protected readonly landing = signal<Record<string, any>>({});
  protected readonly schema = signal<CampaignField[]>([]);

  /** Datos del formulario de reserva (base + campos dinámicos). */
  protected form: Record<string, any> = { name: '', email: '', phone: '', date: '', time: '' };
  protected details: Record<string, any> = {};

  /** Campos que se muestran ahora (según showIf sobre los datos actuales). */
  protected readonly shownFields = computed(() => visibleFields(this.schema(), this.details));

  protected readonly heroImage = computed(() =>
    this.content()['heroImage'] || this.landing()['heroImage'] || '');
  protected readonly includes = computed<any[]>(() =>
    this.landing()['includes'] || this.content()['includes'] || []);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.slug.set(slug);
    this.form['type'] = slug;
    const now = new Date();
    this.booking.getAvailability(now.getMonth() + 1, now.getFullYear(), slug).subscribe({
      next: (res) => {
        const cfg: any = res.config || {};
        // Una campaña sin nombre no está configurada: se trata como inexistente.
        const name = (cfg.content?.name || cfg.landing?.title || res.campaign?.name || '').trim();
        if (!name) { this.notFound.set(true); this.loading.set(false); return; }
        this.campaign.set(res.campaign || null);
        this.content.set(cfg.content || {});
        this.landing.set(cfg.landing || {});
        this.schema.set(Array.isArray(cfg.fieldSchema) ? cfg.fieldSchema : []);
        this.loading.set(false);
      },
      error: () => { this.notFound.set(true); this.loading.set(false); },
    });
  }

  protected title(): string {
    return this.content()['name'] || this.landing()['title'] || 'Sesiones';
  }

  protected subtitle(): string {
    return this.content()['subtitle'] || this.landing()['subtitle'] || '';
  }

  protected submit(): void {
    const problem = this.validate();
    if (problem) { this.error.set(problem); return; }
    this.error.set(null);
    this.submitting.set(true);
    this.booking.reserve({
      name: this.form['name'], email: this.form['email'], phone: this.form['phone'],
      type: this.slug(), date: this.form['date'], time: this.form['time'],
      details: this.details,
    }).subscribe({
      next: () => { this.submitting.set(false); this.done.set(true); },
      error: (e) => {
        this.submitting.set(false);
        this.error.set(e?.error?.message || 'No se pudo completar la reserva. Intenta de nuevo.');
      },
    });
  }

  protected readonly error = signal<string | null>(null);

  private validate(): string | null {
    if (!this.form['name'] || this.form['name'].trim().length < 3) return 'Escribe tu nombre completo.';
    if (!this.form['email']) return 'Escribe tu correo.';
    if (!this.form['phone']) return 'Escribe tu teléfono.';
    if (!this.form['date']) return 'Elige una fecha.';
    if (!this.form['time']) return 'Elige un horario.';
    return validateDynamicFields(this.schema(), this.details);
  }
}
