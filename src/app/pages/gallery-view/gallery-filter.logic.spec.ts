import { filterPhotos, neighbourPhoto } from './gallery-filter.logic';
import { GalleryPhoto } from './gallery.models';

const P = (id: string, set: string, fav = false): GalleryPhoto => ({
  _id: id, filename: id + '.jpg', thumbUrl: 't/' + id, set, isFavorite: fav,
});

describe('gallery-filter.logic', () => {
  const photos = [P('1', 'A'), P('2', 'A', true), P('3', 'B'), P('4', 'B', true)];

  describe('filterPhotos', () => {
    it('should_filter_by_active_set', () => {
      expect(filterPhotos(photos, 'A', false).map(p => p._id)).toEqual(['1', '2']);
    });

    it('should_filter_favorites_only', () => {
      expect(filterPhotos(photos, '', true).map(p => p._id)).toEqual(['2', '4']);
    });

    it('should_combine_set_and_favorites', () => {
      expect(filterPhotos(photos, 'B', true).map(p => p._id)).toEqual(['4']);
    });

    it('should_return_all_when_no_filters', () => {
      expect(filterPhotos(photos, '', false).length).toBe(4);
    });
  });

  describe('neighbourPhoto', () => {
    it('should_get_next', () => {
      expect(neighbourPhoto(photos, '1', 1)?._id).toBe('2');
    });

    it('should_get_previous', () => {
      expect(neighbourPhoto(photos, '2', -1)?._id).toBe('1');
    });

    it('should_return_null_at_start_going_back', () => {
      expect(neighbourPhoto(photos, '1', -1)).toBeNull();
    });

    it('should_return_null_at_end_going_forward', () => {
      expect(neighbourPhoto(photos, '4', 1)).toBeNull();
    });

    it('should_return_null_for_unknown_id', () => {
      expect(neighbourPhoto(photos, 'zzz', 1)).toBeNull();
    });
  });
});
