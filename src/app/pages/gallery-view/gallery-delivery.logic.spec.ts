import {
  coverTextPlacement, galleryAccessMessage, galleryDisplayTitle, gridImageUrl, isClientGalleryUrl, photoAspectRatio, shareLink, swipeDirection,
} from './gallery-delivery.logic';

describe('gallery-delivery.logic', () => {
  describe('galleryDisplayTitle', () => {
    it('should_show_the_name_configured_in_studio', () => {
      expect(galleryDisplayTitle({ title: 'Interno', design: { displayName: 'Bautizo de Mateo' } })).toBe('Bautizo de Mateo');
    });

    it('should_fall_back_to_the_title_when_no_name_was_configured', () => {
      expect(galleryDisplayTitle({ title: 'Interno', design: { displayName: '   ' } })).toBe('Interno');
      expect(galleryDisplayTitle({ title: 'Interno' })).toBe('Interno');
    });
  });

  describe('galleryAccessMessage', () => {
    it('should_explain_that_the_gallery_expired', () => {
      expect(galleryAccessMessage(410)).toContain('venció');
    });

    it('should_explain_that_the_link_is_not_available', () => {
      expect(galleryAccessMessage(404)).toContain('no está disponible');
    });

    it('should_not_block_access_on_temporary_errors', () => {
      expect(galleryAccessMessage(500)).toBeNull();
      expect(galleryAccessMessage(0)).toBeNull();
    });
  });

  describe('isClientGalleryUrl', () => {
    it('should_recognize_the_private_gallery_pages', () => {
      expect(isClientGalleryUrl('/galeria/boda-ana')).toBe(true);
      expect(isClientGalleryUrl('/galeria/boda-ana/ver')).toBe(true);
      expect(isClientGalleryUrl('/galeria/boda-ana?x=1')).toBe(true);
    });

    it('should_not_confuse_public_pages_of_the_site', () => {
      expect(isClientGalleryUrl('/')).toBe(false);
      expect(isClientGalleryUrl('/galerias')).toBe(false);
      expect(isClientGalleryUrl('/paquetes/galeria')).toBe(false);
    });
  });

  describe('shareLink', () => {
    const URL_GALERIA = 'https://danlunaphoto.com/galeria/boda';

    it('should_use_the_native_share_without_a_message', async () => {
      const share = jest.fn().mockResolvedValue(undefined);
      await expect(shareLink({ share }, 'Boda', URL_GALERIA)).resolves.toBeNull();
      expect(share).toHaveBeenCalledWith({ title: 'Boda', url: URL_GALERIA });
    });

    it('should_not_complain_when_the_client_closes_the_share_menu', async () => {
      const share = jest.fn().mockRejectedValue({ name: 'AbortError' });
      await expect(shareLink({ share }, 'Boda', URL_GALERIA)).resolves.toBeNull();
    });

    it('should_copy_when_there_is_no_native_share', async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      await expect(shareLink({ clipboard: { writeText } }, 'Boda', URL_GALERIA)).resolves.toBe('Enlace copiado');
    });

    it('should_fall_back_to_copying_when_native_share_fails', async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      const share = jest.fn().mockRejectedValue(new Error('no'));
      await expect(shareLink({ share, clipboard: { writeText } }, 'Boda', URL_GALERIA)).resolves.toBe('Enlace copiado');
    });

    it('should_never_claim_it_copied_when_it_could_not', async () => {
      const writeText = jest.fn().mockRejectedValue(new Error('denegado'));
      const mensaje = await shareLink({ clipboard: { writeText } }, 'Boda', URL_GALERIA);
      expect(mensaje).toContain('No se pudo copiar');
      expect(mensaje).toContain(URL_GALERIA);
    });
  });

  describe('coverTextPlacement', () => {
    it('should_keep_the_text_away_from_a_centered_or_high_subject', () => {
      expect(coverTextPlacement(50)).toBe('low');
      expect(coverTextPlacement(20)).toBe('low');
      expect(coverTextPlacement(undefined)).toBe('low');
    });

    it('should_move_the_text_up_when_the_subject_is_low', () => {
      expect(coverTextPlacement(80)).toBe('high');
    });
  });

  describe('photoAspectRatio', () => {
    it('should_reserve_the_real_proportion_of_the_photo', () => {
      expect(photoAspectRatio({ width: 6000, height: 4000 }, 'masonry')).toBe('6000 / 4000');
      expect(photoAspectRatio({ width: 6000, height: 4000 }, 'single')).toBe('6000 / 4000');
    });

    it('should_not_interfere_with_layouts_that_set_their_own_size', () => {
      expect(photoAspectRatio({ width: 6000, height: 4000 }, 'grid')).toBeNull();
      expect(photoAspectRatio({ width: 6000, height: 4000 }, 'horizontal')).toBeNull();
    });

    it('should_do_nothing_without_dimensions', () => {
      expect(photoAspectRatio({}, 'masonry')).toBeNull();
      expect(photoAspectRatio({ width: 0, height: 0 }, 'masonry')).toBeNull();
    });
  });

  describe('swipeDirection', () => {
    it('should_go_forward_when_swiping_left_and_back_when_swiping_right', () => {
      expect(swipeDirection(-80, 5)).toBe('next');
      expect(swipeDirection(80, 5)).toBe('prev');
    });

    it('should_ignore_small_movements_and_vertical_scrolling', () => {
      expect(swipeDirection(-20, 0)).toBeNull();
      expect(swipeDirection(-80, 200)).toBeNull();
    });
  });

  describe('gridImageUrl', () => {
    const photo = { thumbUrl: 'thumb.jpg', webUrl: 'web.jpg' };

    it('should_use_the_large_version_when_one_photo_fills_the_width', () => {
      expect(gridImageUrl(photo, 'single')).toBe('web.jpg');
    });

    it('should_use_the_thumbnail_in_multi_column_layouts', () => {
      expect(gridImageUrl(photo, 'masonry')).toBe('thumb.jpg');
    });

    it('should_fall_back_to_the_thumbnail_without_a_web_version', () => {
      expect(gridImageUrl({ thumbUrl: 'thumb.jpg' }, 'single')).toBe('thumb.jpg');
    });
  });
});
