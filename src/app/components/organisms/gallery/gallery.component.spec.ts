import { TestBed } from '@angular/core/testing';
import { GalleryComponent } from './gallery.component';

describe('GalleryComponent', () => {
  let component: GalleryComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GalleryComponent] });
    component = TestBed.createComponent(GalleryComponent).componentInstance;
  });

  it('se crea', () => {
    expect(component).toBeTruthy();
  });

  describe('positionFor (coverflow): posición de cada card respecto a la activa', () => {
    const total = 4;

    it('la card activa es el centro', () => {
      expect(component.positionFor(1, 1, total)).toBe('center');
    });

    it('la siguiente inmediata va a la derecha; la previa, a la izquierda', () => {
      expect(component.positionFor(2, 1, total)).toBe('right');
      expect(component.positionFor(0, 1, total)).toBe('left');
    });

    it('usa el camino circular más corto (envuelve por los extremos)', () => {
      // Activa=0, total=4: la card 3 está a un paso por la izquierda (no a 3 por la derecha).
      expect(component.positionFor(3, 0, total)).toBe('left');
      // La card 1 es la derecha inmediata.
      expect(component.positionFor(1, 0, total)).toBe('right');
    });

    it('las segundas vecinas son far-left / far-right', () => {
      const big = 6;
      expect(component.positionFor(3, 1, big)).toBe('far-right');
      expect(component.positionFor(5, 1, big)).toBe('far-left');
    });

    it('lo que queda más lejos se oculta', () => {
      const big = 8;
      expect(component.positionFor(4, 0, big)).toBe('hidden');
    });
  });

  describe('navegación', () => {
    it('next avanza el índice de forma circular', () => {
      component.currentIndex.set(component.cards.length - 1);
      component.next();
      expect(component.currentIndex()).toBe(0);
    });

    it('prev retrocede el índice de forma circular', () => {
      component.currentIndex.set(0);
      component.prev();
      expect(component.currentIndex()).toBe(component.cards.length - 1);
    });

    it('select fija el índice elegido', () => {
      component.select(2);
      expect(component.currentIndex()).toBe(2);
      expect(component.activeCard()).toBe(component.cards[2]);
    });
  });

  it('positioned() marca exactamente una card como center: la activa', () => {
    component.currentIndex.set(2);
    const centers = component.positioned().filter((p) => p.position === 'center');
    expect(centers.length).toBe(1);
    expect(centers[0].card).toBe(component.cards[2]);
  });

  describe('swipe táctil', () => {
    it('detecta swipe a la izquierda cuando el dedo se mueve suficiente hacia la izquierda', () => {
      expect(component.swipeDirection(200, 100)).toBe('left');
    });

    it('detecta swipe a la derecha', () => {
      expect(component.swipeDirection(100, 200)).toBe('right');
    });

    it('ignora movimientos por debajo del umbral (tap, no swipe)', () => {
      expect(component.swipeDirection(100, 120)).toBe('none');
    });

    it('swipe a la izquierda avanza a la siguiente sesión', () => {
      component.currentIndex.set(0);
      component.onTouchStart({ changedTouches: [{ clientX: 250 }] } as unknown as TouchEvent);
      component.onTouchEnd({ changedTouches: [{ clientX: 100 }] } as unknown as TouchEvent);
      expect(component.currentIndex()).toBe(1);
    });

    it('swipe a la derecha retrocede a la sesión anterior', () => {
      component.currentIndex.set(1);
      component.onTouchStart({ changedTouches: [{ clientX: 100 }] } as unknown as TouchEvent);
      component.onTouchEnd({ changedTouches: [{ clientX: 260 }] } as unknown as TouchEvent);
      expect(component.currentIndex()).toBe(0);
    });

    it('un tap (sin desplazamiento) no cambia la sesión activa', () => {
      component.currentIndex.set(2);
      component.onTouchStart({ changedTouches: [{ clientX: 150 }] } as unknown as TouchEvent);
      component.onTouchEnd({ changedTouches: [{ clientX: 158 }] } as unknown as TouchEvent);
      expect(component.currentIndex()).toBe(2);
    });
  });
});
