import { masonryColumns } from './masonry-columns';

const foto = (id: string, width?: number, height?: number) => ({ id, width, height });
const ids = (columnas: { id: string }[][]) => columnas.map((c) => c.map((p) => p.id));

describe('masonryColumns', () => {
  it('la primera fila se lee de izquierda a derecha, en el orden de la galería', () => {
    const columnas = masonryColumns([foto('1', 4, 3), foto('2', 3, 4), foto('3', 4, 3), foto('4', 4, 3)], 3);
    expect(columnas.map((c) => c[0].id)).toEqual(['1', '2', '3']);
  });

  it('cada foto va a la columna más corta para que queden parejas', () => {
    const columnas = masonryColumns([foto('alta', 1, 2), foto('baja', 2, 1), foto('otra', 2, 1)], 2);
    expect(ids(columnas)).toEqual([['alta'], ['baja', 'otra']]);
  });

  it('dentro de cada columna conserva el orden', () => {
    const columnas = masonryColumns(Array.from({ length: 12 }, (_, i) => foto(String(i), 1, 1)), 3);
    expect(ids(columnas)).toEqual([['0', '3', '6', '9'], ['1', '4', '7', '10'], ['2', '5', '8', '11']]);
  });

  it('una foto sin medidas cuenta como cuadrada', () => {
    const columnas = masonryColumns([foto('sin'), foto('alta', 1, 3), foto('tercera', 1, 1)], 2);
    expect(ids(columnas)).toEqual([['sin', 'tercera'], ['alta']]);
  });

  it('no pierde ni repite fotos', () => {
    const fotos = Array.from({ length: 50 }, (_, i) => foto(String(i), 3 + (i % 3), 4));
    expect(masonryColumns(fotos, 3).flat().map((p) => p.id).sort()).toEqual(fotos.map((p) => p.id).sort());
  });

  it('sin fotos deja las columnas vacías', () => {
    expect(masonryColumns([], 2)).toEqual([[], []]);
  });
});
