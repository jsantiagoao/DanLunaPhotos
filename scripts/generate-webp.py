"""
Genera el hermano .webp de cada .jpg/.jpeg que aun no lo tenga.

Responsabilidad unica: SOLO crea el webp gemelo. No re-optimiza el JPG, no
borra nada, no toca referencias en el codigo. El JPG queda intacto como
fallback para <picture>.

A diferencia de optimize-images.py (que asume imagenes sin optimizar y las
reescribe), este script sirve el caso "las fotos ya estan optimizadas en JPG,
solo falta la version webp para servir con <picture>".

Uso:
    python3 scripts/generate-webp.py          # simulacro, no escribe
    python3 scripts/generate-webp.py --apply  # genera los .webp faltantes

Revertir: `find src/assets -name '*.webp' -newer <marca>` o git.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'images'
WEBP_QUALITY = 80
# Todo JPG que se sirva con <app-image> necesita su webp, o el <source> apunta
# a un 404. Los thumbs de galeria pesan 20-28 KB, asi que el umbral cubre desde
# 8 KB. Por debajo son iconos/sprites que no pasan por app-image.
MIN_BYTES = 8 * 1024


def human(n: int) -> str:
    return f'{n / 1048576:.2f} MB' if n >= 1048576 else f'{n / 1024:.0f} KB'


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='escribe los .webp')
    args = parser.parse_args()

    if not ASSETS.is_dir():
        print(f'No existe {ASSETS}', file=sys.stderr)
        return 1

    jpgs = sorted(
        p for p in ASSETS.rglob('*')
        if p.suffix.lower() in {'.jpg', '.jpeg'}
    )

    creados = 0
    saltados_existe = 0
    saltados_chico = 0
    saltados_no_mejora = 0
    total_jpg = 0
    total_webp = 0

    for jpg in jpgs:
        webp = jpg.with_suffix('.webp')
        if webp.exists():
            saltados_existe += 1
            continue

        size = jpg.stat().st_size
        if size < MIN_BYTES:
            saltados_chico += 1
            continue

        from io import BytesIO
        with Image.open(jpg) as img:
            buf = BytesIO()
            img.convert('RGB').save(buf, 'WEBP', quality=WEBP_QUALITY, method=6)
            webp_size = buf.tell()

            # Si el webp no es mas chico que el jpg, no aporta. Se omite.
            if webp_size >= size:
                saltados_no_mejora += 1
                continue

            if args.apply:
                webp.write_bytes(buf.getvalue())

        rel = jpg.relative_to(ASSETS)
        print(f'  {human(size):>9} -> {human(webp_size):>9}  {rel}')
        creados += 1
        total_jpg += size
        total_webp += webp_size

    modo = '' if args.apply else '[SIMULACRO (nada escrito)] '
    print()
    print(f'{modo}{creados} webp generados | '
          f'ya existian: {saltados_existe} | '
          f'muy chicos: {saltados_chico} | '
          f'webp no mejora: {saltados_no_mejora}')
    if creados:
        ahorro = total_jpg - total_webp
        pct = 100 * ahorro / total_jpg if total_jpg else 0
        print(f'Peso jpg {human(total_jpg)} -> webp {human(total_webp)} '
              f'| ahorro {human(ahorro)} ({pct:.0f}%) en las imagenes cubiertas')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
