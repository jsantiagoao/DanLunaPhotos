import {
  CHRISTMAS_PACKAGE_ID, EXTRA_PERSON_PRICE, MAX_AFORO, MAX_PERSONAS, MAX_PERSONAS_EXTRA, PET_SIZES,
  emptyChristmasForm, priceChangeNotice, sessionTotal, toBookingRequest, validateChristmasForm, whatsappConfirmUrl,
} from './christmas-booking.logic';

/**
 * Reglas del formulario navideño, fuera del componente.
 *
 * Lo que se valida aqui es lo mismo que valida `shared/navidad.py`: el servidor no
 * confia en el navegador. La diferencia es que aqui el mensaje se le muestra a la
 * clienta junto al campo, antes de que envie.
 */
function valido(over: Record<string, any> = {}) {
  return {
    ...emptyChristmasForm(),
    name: 'Ana Torres', email: 'ana@example.com', phone: '4421234567',
    date: '2026-12-06', time: '09:50', personas: 3,
    ...over,
  };
}

describe('emptyChristmasForm', () => {
  it('empieza con una persona', () => {
    expect(emptyChristmasForm().personas).toBe(1);
  });

  it('la mascota se pregunta, no se presume', () => {
    expect(emptyChristmasForm().mascota).toBe(false);
  });

  it('caben hasta cinco personas', () => {
    expect(MAX_PERSONAS).toBe(5);
  });

  it('la mascota tiene tres tamaños', () => {
    expect(PET_SIZES).toEqual(['chico', 'mediano', 'grande']);
  });
});

describe('validateChristmasForm', () => {
  it('un formulario completo es valido', () => {
    expect(validateChristmasForm(valido())).toBeNull();
  });

  it('exige nombre', () => {
    expect(validateChristmasForm(valido({ name: 'An' }))).toContain('nombre');
  });

  it('exige un correo con forma de correo', () => {
    expect(validateChristmasForm(valido({ email: 'ana@' }))).toContain('correo');
  });

  it('exige diez digitos de telefono', () => {
    expect(validateChristmasForm(valido({ phone: '442123' }))).toContain('teléfono');
  });

  it('acepta el telefono con espacios', () => {
    expect(validateChristmasForm(valido({ phone: '442 123 4567' }))).toBeNull();
  });

  it('no acepta mas de cinco personas', () => {
    expect(validateChristmasForm(valido({ personas: 6 }))).toContain('personas');
  });

  it('con mascota exige tamaño', () => {
    const error = validateChristmasForm(valido({ mascota: true, mascotaNombre: 'Nieve' }));
    expect(error).toContain('tamaño');
  });

  it('con mascota exige nombre de la mascota', () => {
    const error = validateChristmasForm(valido({ mascota: true, mascotaTamano: 'chico' }));
    expect(error).toContain('mascota');
  });

  it('con mascota completa es valido', () => {
    const form = valido({ mascota: true, mascotaTamano: 'grande', mascotaNombre: 'Nieve' });
    expect(validateChristmasForm(form)).toBeNull();
  });

  it('la peticion especial es opcional', () => {
    expect(validateChristmasForm(valido({ peticionEspecial: '' }))).toBeNull();
  });

  it('la peticion especial tiene tope', () => {
    expect(validateChristmasForm(valido({ peticionEspecial: 'x'.repeat(501) }))).toContain('petición');
  });

  it('exige haber elegido dia y horario', () => {
    expect(validateChristmasForm(valido({ time: '' }))).toContain('horario');
  });
});

describe('toBookingRequest', () => {
  it('reserva como sesion navideña', () => {
    expect(toBookingRequest(valido()).type).toBe('navidad');
  });

  it('identifica el paquete de la campaña', () => {
    // Sin paquete, en el panel la sesion aparece sin nombre y sin precio de catalogo.
    expect(toBookingRequest(valido()).package).toBe(CHRISTMAS_PACKAGE_ID);
  });

  it('manda el telefono sin espacios', () => {
    expect(toBookingRequest(valido({ phone: '442 123 4567' })).phone).toBe('4421234567');
  });

  it('los datos de la sesion viajan en details', () => {
    const req = toBookingRequest(valido({ personas: 4, peticionEspecial: 'trineo' }));
    expect(req.details).toEqual({ personas: 4, mascota: false, peticionEspecial: 'trineo' });
  });

  it('sin mascota no manda su tamaño ni su nombre', () => {
    const req = toBookingRequest(valido({ mascota: false, mascotaTamano: 'chico', mascotaNombre: 'Nieve' }));
    expect(req.details['mascotaNombre']).toBeUndefined();
  });

  it('con mascota los manda recortados', () => {
    const req = toBookingRequest(valido({ mascota: true, mascotaTamano: 'grande', mascotaNombre: '  Nieve  ' }));
    expect(req.details['mascotaNombre']).toBe('Nieve');
  });

  it('una peticion vacia no viaja', () => {
    expect(toBookingRequest(valido()).details['peticionEspecial']).toBeUndefined();
  });
});

describe('whatsappConfirmUrl', () => {
  it('escribe a Dan Luna', () => {
    expect(whatsappConfirmUrl(valido())).toContain('wa.me/524424906891');
  });

  it('el mensaje lleva el nombre de quien reserva', () => {
    expect(decodeURIComponent(whatsappConfirmUrl(valido()))).toContain('Ana Torres');
  });

  it('y el dia y el horario apartados', () => {
    const texto = decodeURIComponent(whatsappConfirmUrl(valido()));
    expect(texto).toContain('6 de diciembre');
    expect(texto).toContain('09:50');
  });

  it('pide enviar el comprobante', () => {
    expect(decodeURIComponent(whatsappConfirmUrl(valido())).toLowerCase()).toContain('comprobante');
  });
});

describe('personas extra', () => {
  it('el formulario empieza sin extras', () => {
    expect(emptyChristmasForm().personasExtra).toBe(0);
  });

  it('se permiten hasta tres', () => {
    expect(MAX_PERSONAS_EXTRA).toBe(3);
  });

  it('en el set caben ocho', () => {
    expect(MAX_AFORO).toBe(8);
  });

  it('cada extra cuesta 250', () => {
    expect(EXTRA_PERSON_PRICE).toBe(250);
  });

  it('hasta tres extras es valido', () => {
    expect(validateChristmasForm(valido({ personas: 5, personasExtra: 3 }))).toBeNull();
  });

  it('mas de tres no', () => {
    expect(validateChristmasForm(valido({ personas: 2, personasExtra: 4 }))).toContain('extra');
  });

  it('no se puede pasar del aforo del set', () => {
    // El aforo es fisico: no depende de lo que la clienta quiera pagar.
    expect(validateChristmasForm(valido({ personas: 5, personasExtra: 3 }))).toBeNull();
  });

  it('los extras viajan en el detalle', () => {
    expect(toBookingRequest(valido({ personasExtra: 2 })).details['personasExtra']).toBe(2);
  });

  it('sin extras no ensucia el detalle', () => {
    expect(toBookingRequest(valido({ personasExtra: 0 })).details['personasExtra']).toBeUndefined();
  });
});

describe('sessionTotal', () => {
  it('sin extras es el precio de la sesion', () => {
    expect(sessionTotal(1800, valido())).toBe(1800);
  });

  it('cada extra suma 250', () => {
    expect(sessionTotal(1800, valido({ personasExtra: 2 }))).toBe(2300);
  });

  it('en precio regular tambien suma', () => {
    expect(sessionTotal(2300, valido({ personasExtra: 3 }))).toBe(3050);
  });
});

describe('priceChangeNotice', () => {
  const campaign = (over: Record<string, any> = {}) => ({
    name: 'NOËL TALE', price: 1800, regularPrice: 2300, preventaActive: true,
    preventaEndsOn: '2026-09-24', spotsLeft: 5, apartado: 500, sessionMinutes: 40,
    ...over,
  });

  it('no avisa si el precio sigue igual', () => {
    expect(priceChangeNotice(1800, campaign({ price: 1800 }))).toBeNull();
  });

  it('avisa cuando la preventa se agoto y el precio subio', () => {
    // La clienta vio 1800; al enviar la preventa ya se acabo y cuesta 2300.
    const aviso = priceChangeNotice(1800, campaign({ price: 2300, preventaActive: false }));
    expect(aviso).not.toBeNull();
    expect(aviso).toContain('2,300');
  });

  it('no avisa si el precio bajo (no perjudica a la clienta)', () => {
    expect(priceChangeNotice(2300, campaign({ price: 1800 }))).toBeNull();
  });

  it('no avisa si nunca vio un precio', () => {
    // Si la campaña no habia cargado, no hay contra que comparar.
    expect(priceChangeNotice(0, campaign())).toBeNull();
    expect(priceChangeNotice(null, campaign())).toBeNull();
  });

  it('no avisa si no hay campaña', () => {
    expect(priceChangeNotice(1800, null)).toBeNull();
  });
});
