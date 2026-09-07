import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from './seo.service';

/**
 * SeoService centraliza Title + Meta (description/OG/Twitter) + canonical +
 * JSON-LD, que hoy se repite en cada pagina (viola DRY). Estas pruebas fijan
 * que aplica los tags correctos desde un objeto de configuracion.
 */
describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SeoService, Title, Meta] });
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
    doc.querySelectorAll('link[rel="canonical"], script[type="application/ld+json"]').forEach(n => n.remove());
  });

  it('should_set_title', () => {
    service.apply({ title: 'Hola', description: 'd', url: 'https://x.com' });
    expect(title.getTitle()).toBe('Hola');
  });

  it('should_set_description_and_og_tags', () => {
    service.apply({ title: 'T', description: 'Desc', url: 'https://x.com/p' });
    expect(meta.getTag('name="description"')?.content).toBe('Desc');
    expect(meta.getTag('property="og:title"')?.content).toBe('T');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://x.com/p');
  });

  it('should_create_canonical_link', () => {
    service.apply({ title: 'T', description: 'd', url: 'https://x.com/canon' });
    const link = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(link?.href).toBe('https://x.com/canon');
  });

  it('should_inject_jsonld_when_provided', () => {
    service.apply({ title: 'T', description: 'd', url: 'https://x.com', jsonLd: { '@type': 'Thing' } });
    const script = doc.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.textContent).toContain('@type');
  });

  it('should_remove_injected_jsonld_on_clear', () => {
    service.apply({ title: 'T', description: 'd', url: 'https://x.com', jsonLd: { '@type': 'Thing' } });
    service.clearJsonLd();
    expect(doc.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
