"""
Optimiza las imagenes de src/assets para la web.

El sitio servia 215 MB, con un hero de 24 MB en PNG (5644px de ancho, sin canal
alfa: una fotografia guardada en el formato equivocado). Este script las
redimensiona a un ancho razonable, las reencoda y genera un hermano .webp.

Que hace con cada tipo:
  - .jpg/.jpeg  -> se reescriben en su sitio, mismo nombre. No rompe referencias.
  - .png grande -> se convierte a .jpg (son fotografias) y se borra el original.
                   Hay que actualizar las referencias a mano; el script las lista.
  - .png chico  -> intacto. Son logos e iconos, donde PNG si es el formato bueno.

Todo archivo por debajo de MIN_BYTES se ignora, para no degradar iconos.

Uso:
    python3 scripts/optimize-images.py            # simulacro, no escribe
    python3 scripts/optimize-images.py --apply    # aplica
    python3 scripts/optimize-images.py --apply --max-width 2560

Los originales estan versionados en git: `git checkout -- src/assets` revierte.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'images'

# Por debajo de esto no se toca nada: logos, iconos, sprites.
MIN_BYTES = 120 * 1024

# Un PNG mas pesado que esto se asume fotografia, no grafico con transparencia.
PNG_PHOTO_BYTES = 500 * 1024

# Solo las imagenes grandes reciben hermano .webp: son las que se sirven con
# <picture>. Generarlo para todas anade peso muerto que nadie descarga.
WEBP_MIN_BYTES = 1024 * 1024

JPEG_QUALITY = 82
WEBP_QUALITY = 80

RASTER = {'.jpg', '.jpeg', '.png'}


def human(n: int) -> str:
    return f'{n/1048576:.2f} MB' if n >= 1048576 else f'{n/1024:.0f} KB'


def resized(img: Image.Image, max_width: int) -> Image.Image:
    """Reduce al ancho maximo conservando proporcion. Nunca amplia."""
    if img.width <= max_width:
        return img
    height = round(img.height * max_width / img.width)
    return img.resize((max_width, height), Image.LANCZOS)


def process(path: Path, max_width: int, apply: bool):
    """Devuelve (bytes_antes, bytes_despues, nota) o None si se ignora."""
    before = path.stat().st_size
    if before < MIN_BYTES:
        return None

    es_png = path.suffix.lower() == '.png'
    if es_png and before < PNG_PHOTO_BYTES:
        return None  # grafico pequeno: PNG es correcto

    from io import BytesIO

    quiere_webp = before >= WEBP_MIN_BYTES

    with Image.open(path) as original:
        img = resized(original.convert('RGB'), max_width)

        buf_jpg = BytesIO()
        img.save(buf_jpg, 'JPEG', quality=JPEG_QUALITY, optimize=True, progressive=True)
        after = buf_jpg.tell()

        buf_webp = None
        if quiere_webp:
            buf_webp = BytesIO()
            img.save(buf_webp, 'WEBP', quality=WEBP_QUALITY, method=6)
            after += buf_webp.tell()

        # Reencodear una imagen ya optimizada la engorda. Si no mejora, no se toca.
        if after >= before and not es_png:
            return None

        destino = path.with_suffix('.jpg') if es_png else path
        if apply:
            destino.write_bytes(buf_jpg.getvalue())
            if buf_webp:
                path.with_suffix('.webp').write_bytes(buf_webp.getvalue())
            if es_png and destino != path:
                path.unlink()

    nota = f'PNG->JPG (actualizar referencias a {destino.name})' if es_png else ''
    return before, after, nota


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='escribe los cambios')
    parser.add_argument('--max-width', type=int, default=1920)
    args = parser.parse_args()

    if not ASSETS.is_dir():
        print(f'No existe {ASSETS}', file=sys.stderr)
        return 1

    archivos = sorted(p for p in ASSETS.rglob('*') if p.suffix.lower() in RASTER)
    total_antes = total_despues = tocados = 0
    renombres = []

    for path in archivos:
        resultado = process(path, args.max_width, args.apply)
        if not resultado:
            continue
        antes, despues, nota = resultado
        total_antes += antes
        total_despues += despues
        tocados += 1
        if nota:
            renombres.append((path, nota))
        rel = path.relative_to(ASSETS.parent.parent)
        print(f'  {human(antes):>9} -> {human(despues):>9}  {rel}')

    print()
    if renombres:
        print('Referencias que hay que actualizar en el codigo:')
        for path, nota in renombres:
            print(f'  {path.name}: {nota}')
        print()

    ahorro = total_antes - total_despues
    pct = (ahorro / total_antes * 100) if total_antes else 0
    modo = 'APLICADO' if args.apply else 'SIMULACRO (nada escrito)'
    print(f'[{modo}] {tocados} imagenes | {human(total_antes)} -> {human(total_despues)} '
          f'| ahorro {human(ahorro)} ({pct:.1f}%)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
