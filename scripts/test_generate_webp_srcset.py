"""Tests de la logica anti-upscale de generate-webp-srcset."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location(
    'gen_srcset', Path(__file__).parent / 'generate-webp-srcset.py'
)
gen = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gen)


def test_only_widths_smaller_than_original():
    # Foto 1920px: genera 400/800/1200/1600, nunca >= 1920.
    assert gen.widths_for(1920) == [400, 800, 1200, 1600]


def test_no_upscale_for_medium_image():
    # Foto 1024px: solo 400 y 800 (1200/1600 serian upscale).
    assert gen.widths_for(1024) == [400, 800]


def test_small_image_returns_only_original_width():
    # Foto 300px (menor que el menor target 400): solo su ancho, sin agrandar.
    assert gen.widths_for(300) == [300]


def test_exact_boundary_excludes_equal_width():
    # 800px exacto: 1200/1600 fuera; 400 dentro; 800 no se duplica (< estricto).
    assert gen.widths_for(800) == [400]
