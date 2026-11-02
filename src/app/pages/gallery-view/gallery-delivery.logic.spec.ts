import { galleryAccessMessage, galleryDisplayTitle, gridImageUrl, isClientGalleryUrl } from './gallery-delivery.logic';

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
