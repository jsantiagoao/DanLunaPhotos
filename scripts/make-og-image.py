"""
Genera assets/images/og-default.jpg — la imagen que ven Facebook, WhatsApp,
LinkedIn y Telegram cuando alguien comparte el sitio.

Por que existe este script y no solo el .jpg: la imagen estaba referenciada en
index.html, en el JSON-LD y en home.component.ts, pero el archivo nunca existio.
En produccion /assets/images/og-default.jpg devolvia 200 con content-type
text/html — el fallback SPA de CloudFront — asi que cada vez que alguien
compartia danlunaphoto.com el preview salia sin foto. Dejar el generador
versionado evita que el asset se vuelva a perder sin que nadie sepa como rehacerlo.

Composicion: el hero (fachada naranja de Queretaro) recortado a 1200x630, un
degradado calido al pie para que el texto se lea, y el lockup de marca centrado.

Uso:
    python3 scripts/make-og-image.py            # simulacro, no escribe
    python3 scripts/make-og-image.py --apply
"""
import argparse
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / 'src' / 'assets' / 'images'

SOURCE = IMAGES / 'bg' / 'hero-bg.jpg'
LOGO = IMAGES / 'logo-light.png'
TARGET = IMAGES / 'og-default.jpg'

# Medida canonica de Open Graph. Facebook y WhatsApp recortan cualquier otra cosa.
SIZE = (1200, 630)

# El hero mide 1920x1280. Un recorte a ancho completo da 1920x1008; bajarlo 120px
# deja fuera el empedrado muerto del pie sin cortar a las personas.
CROP_TOP = 120

# Tokens de src/styles.scss. La tarjeta tiene que verse como el sitio.
CREAM = (249, 245, 242)
DARK = (45, 36, 32)

TAGLINE = 'FOTOGRAFÍA PROFESIONAL · QUERÉTARO'

# DM Sans es la sans del sitio y no vive en el repo (se carga de Google Fonts en
# runtime). Para render offline se cachea el variable font, licencia OFL.
FONT_URL = ('https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/'
            'DMSans%5Bopsz%2Cwght%5D.ttf')
FONT_CACHE = ROOT / '.cache' / 'DMSans.ttf'


def load_font(size: int, weight: int) -> ImageFont.FreeTypeFont:
    """DM Sans en el peso pedido, descargando el variable font la primera vez."""
    if not FONT_CACHE.exists():
        FONT_CACHE.parent.mkdir(parents=True, exist_ok=True)
        print(f'  descargando DM Sans -> {FONT_CACHE}')
        FONT_CACHE.write_bytes(urllib.request.urlopen(FONT_URL, timeout=60).read())
    font = ImageFont.truetype(str(FONT_CACHE), size)
    font.set_variation_by_axes([14, weight])  # [optical size, weight]
    return font


def brand_photo() -> Image.Image:
    """Hero recortado a 1200x630 con el degradado de pie."""
    photo = Image.open(SOURCE).convert('RGB')
    ratio = SIZE[0] / SIZE[1]
    height = round(photo.width / ratio)
    top = min(CROP_TOP, photo.height - height)
    photo = photo.crop((0, top, photo.width, top + height))
    photo = photo.resize(SIZE, Image.LANCZOS)

    # Degradado: transparente arriba, casi opaco al pie. Sin el, el trazo fino del
    # logo se pierde sobre el empedrado claro.
    scrim = Image.new('L', (1, SIZE[1]), 0)
    px = scrim.load()
    start = int(SIZE[1] * 0.30)
    for y in range(start, SIZE[1]):
        t = (y - start) / (SIZE[1] - start)
        px[0, y] = int(248 * t ** 1.25)
    overlay = Image.new('RGB', SIZE, DARK)
    return Image.composite(overlay, photo, scrim.resize(SIZE))


def brand_mark(width: int) -> Image.Image:
    """El logo recoloreado a crema.

    logo-light.png es tinta negra sobre blanco y sin canal alfa, asi que pegarlo
    tal cual pondria un rectangulo blanco encima de la foto. Se usa la luminancia
    invertida como mascara: lo oscuro del trazo se vuelve opaco y el blanco del
    fondo desaparece, conservando el antialias del original.
    """
    logo = Image.open(LOGO).convert('L')
    height = round(logo.height * width / logo.width)
    logo = logo.resize((width, height), Image.LANCZOS)
    alpha = Image.eval(logo, lambda v: 255 - v)
    mark = Image.new('RGBA', logo.size, CREAM + (0,))
    mark.putalpha(alpha)
    return mark


def build() -> Image.Image:
    card = brand_photo()

    # Lockup abajo a la izquierda, no centrado: la pareja ocupa el centro del
    # encuadre y el trazo fino del logo encima de ella no se leia. La esquina
    # inferior izquierda es empedrado, la zona mas calmada de la foto.
    margin = 64
    mark = brand_mark(width=300)
    mark_y = 424
    card.paste(mark, (margin, mark_y), mark)

    draw = ImageDraw.Draw(card)
    font = load_font(size=21, weight=500)

    # PIL no tiene letter-spacing: se dibuja caracter por caracter. En mayusculas
    # y a este tamano el tracking es lo que separa "editorial" de "predeterminado".
    x = margin + 2
    y = mark_y + mark.height + 26
    for ch in TAGLINE:
        draw.text((x, y), ch, font=font, fill=CREAM)
        x += draw.textlength(ch, font=font) + 4.0

    return card


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='escribe el archivo')
    args = parser.parse_args()

    for path in (SOURCE, LOGO):
        if not path.exists():
            print(f'falta {path}', file=sys.stderr)
            return 1

    card = build()
    if not args.apply:
        print(f'simulacro: se escribiria {TARGET} ({SIZE[0]}x{SIZE[1]})')
        print('re-ejecuta con --apply')
        return 0

    card.save(TARGET, 'JPEG', quality=86, optimize=True, progressive=True)
    print(f'{TARGET.relative_to(ROOT)}  {TARGET.stat().st_size // 1024} KB')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
