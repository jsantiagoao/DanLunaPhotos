import {
  fieldIsVisible, visibleFields, validateDynamicFields, type CampaignField,
} from './campaign-fields.logic';

const SCHEMA: CampaignField[] = [
  { key: 'personas', label: 'Personas', type: 'number', required: true, min: 1, max: 5 },
  { key: 'mascota', label: '¿Mascota?', type: 'boolean' },
  { key: 'mascotaNombre', label: 'Nombre', type: 'text', showIf: 'mascota==true', required: true },
];

describe('campaign-fields.logic (landing)', () => {
  describe('fieldIsVisible', () => {
    it('sin showIf siempre visible', () => {
      expect(fieldIsVisible({ key: 'x', label: 'X', type: 'text' }, {})).toBe(true);
    });
    it('showIf mascota==true se cumple', () => {
      expect(fieldIsVisible(SCHEMA[2], { mascota: true })).toBe(true);
    });
    it('showIf mascota==true no se cumple', () => {
      expect(fieldIsVisible(SCHEMA[2], { mascota: false })).toBe(false);
    });
  });

  describe('visibleFields', () => {
    it('oculta el campo condicionado cuando no aplica', () => {
      const vis = visibleFields(SCHEMA, { mascota: false }).map((f) => f.key);
      expect(vis).toEqual(['personas', 'mascota']);
    });
    it('muestra el condicionado cuando aplica', () => {
      const vis = visibleFields(SCHEMA, { mascota: true }).map((f) => f.key);
      expect(vis).toContain('mascotaNombre');
    });
  });

  describe('validateDynamicFields', () => {
    it('exige los requeridos visibles', () => {
      expect(validateDynamicFields(SCHEMA, {})).not.toBeNull();
    });
    it('no exige un requerido oculto', () => {
      expect(validateDynamicFields(SCHEMA, { personas: 2, mascota: false })).toBeNull();
    });
    it('exige el requerido cuando su condición se cumple', () => {
      expect(validateDynamicFields(SCHEMA, { personas: 2, mascota: true })).not.toBeNull();
    });
    it('respeta min/max de number', () => {
      expect(validateDynamicFields(SCHEMA, { personas: 9 })).not.toBeNull();
    });
    it('acepta datos válidos', () => {
      expect(validateDynamicFields(SCHEMA, { personas: 3, mascota: false })).toBeNull();
    });
  });
});
