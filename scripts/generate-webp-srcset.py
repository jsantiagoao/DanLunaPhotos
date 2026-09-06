"""
Genera variantes responsive webp por ancho (para srcset): foto-<w>.webp.

Responsabilidad unica: SOLO crea las variantes de ancho para servir con srcset.
No toca el jpg original ni el webp gemelo 1:1 (eso lo hace generate-webp.py),
no borra nada, no toca referencias.

Convencion de nombres (la comparte src/app/shared/ui/app-image/to-srcset.ts):
    gallery/boda.jpg  ->  gallery/boda-400.webp, boda-800.webp, ...

Regla anti-upscale: solo genera anchos <= ancho original. Nunca agranda.

Uso:
    python3 scripts/generate-webp-srcset.py          # simulacro
    python3 scripts/generate-webp-srcset.py --apply  # escribe las variantes
"""
import argparse
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'images'
WEBP_QUALITY = 80
MIN_BYTES = 8 * 1024
# Anchos objetivo alineados con los breakpoints de la landing.
TARGET_WIDTHS = [400, 800, 1200, 1600]


def widths_for(original_width: int, targets=TARGET_WIDTHS) -> list[int]:
    """Anchos a generar: los <= original (anti-upscale). Si el original es mas
    chico que el menor target, se genera solo el ancho original una vez."""
    usable = [w for w in targets if w < original_width]
    # Incluir el ancho original si ningun target lo cubre exactamente y es util.
    if original_width <= min(targets):
        return [original_width]
    return usable


def human(n: int) -> str:
    return f'{n / 1048576:.2f} MB' if n >= 1048576 else f'{n / 1024:.0f} KB'


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='escribe las variantes')
    args = parser.parse_args()

    if not ASSETS.is_dir():
        print(f'No existe {ASSETS}', file=sys.stderr)
        return 1

    jpgs = sorted(
        p for p in ASSETS.rglob('*')
        if p.suffix.lower() in {'.jpg', '.jpeg'}
    )

    creadas = 0
    saltadas_chico = 0
    fotos = 0
    total_bytes = 0

    for jpg in jpgs:
        if jpg.stat().st_size < MIN_BYTES:
            saltadas_chico += 1
            continue

        with Image.open(jpg) as img:
            img = img.convert('RGB')
            ow, oh = img.size
            targets = widths_for(ow)
            if not targets:
                continue
            fotos += 1

            for w in targets:
                variant = jpg.with_name(f'{jpg.stem}-{w}.webp')
                if variant.exists():
                    continue
                h = round(oh * w / ow)
                resized = img.resize((w, h), Image.LANCZOS)
                buf = BytesIO()
                resized.save(buf, 'WEBP', quality=WEBP_QUALITY, method=6)
                if args.apply:
                    variant.write_bytes(buf.getvalue())
                creadas += 1
                total_bytes += buf.tell()
                print(f'  {w:>4}w {human(buf.tell()):>8}  {variant.relative_to(ASSETS)}')

    modo = '' if args.apply else '[SIMULACRO (nada escrito)] '
    print()
    print(f'{modo}{creadas} variantes generadas de {fotos} fotos | '
          f'muy chicas: {saltadas_chico} | peso total variantes: {human(total_bytes)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
