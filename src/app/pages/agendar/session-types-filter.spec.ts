import { filterBookableTypes, SessionTypeConfig } from './session-types.config';

/**
 * filterBookableTypes deja en /agendar solo los tipos agendables por el flujo
 * genérico. Las campañas (kind='campaign') tienen su propia landing y se excluyen
 * (ADR-007). Se conserva el fallback por slug para datos sin `kind`.
 */

function tipo(over: Partial<SessionTypeConfig>): SessionTypeConfig {
  return { id: 'bautizo', label: 'Bautizo', packages: [], ...over };
}

describe('filterBookableTypes', () => {
  it('deja pasar los tipos simples', () => {
    const res = filterBookableTypes([tipo({ id: 'familia', kind: 'simple' })]);
    expect(res.map((t) => t.id)).toEqual(['familia']);
  });

  it('excluye las campañas por su kind', () => {
    const res = filterBookableTypes([
      tipo({ id: 'familia', kind: 'simple' }),
      tipo({ id: 'dia_madres', label: 'Día de las Madres', kind: 'campaign' }),
    ]);
    expect(res.map((t) => t.id)).toEqual(['familia']);
  });

  it('excluye navidad por slug aunque no traiga kind (fallback datos viejos)', () => {
    const res = filterBookableTypes([
      tipo({ id: 'bautizo' }),
      tipo({ id: 'navidad', label: 'Navidad' }),
    ]);
    expect(res.map((t) => t.id)).toEqual(['bautizo']);
  });

  it('no rompe con una lista vacía', () => {
    expect(filterBookableTypes([])).toEqual([]);
  });
});
