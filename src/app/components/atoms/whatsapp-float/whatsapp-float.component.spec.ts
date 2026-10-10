import { WhatsappFloatComponent } from './whatsapp-float.component';
import { WHATSAPP_NUMBER } from '../../../shared/contact-info';

describe('WhatsappFloatComponent', () => {
  it('should_use_a_general_message_not_a_past_campaign', () => {
    // Regresión: todo el sitio enviaba "vi la promoción del Día de las Madres".
    const text = decodeURIComponent(new WhatsappFloatComponent().waUrl);
    expect(text).not.toContain('Madres');
    expect(text).toContain('sesión');
  });

  it('should_point_to_the_studio_number', () => {
    expect(new WhatsappFloatComponent().waUrl).toContain(`wa.me/${WHATSAPP_NUMBER}`);
  });
});
