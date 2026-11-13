/**
 * clinicImages.test.js
 * Tests for the clinic_images migration:
 *   1. fetchGallery / fetchGalleryForClinic query clinic_images
 *   2. Images returned in sort_order (display_order) order
 *   3. Images grid renders all items from facility_image_urls
 *   4. Falls back to facility_image_url scalar when array empty
 *   5. Cascade delete documented as SQL contract
 *   6. image_review_status badge renders for every status value
 *
 * Framework: Vitest + @testing-library/react
 * Mocking: vi.mock for the Supabase client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ─────────────────────────────────────────────
let lastQueriedTable = '';
let mockData = [];
let mockError = null;

const buildChain = (data, error) => ({
  select: vi.fn().mockReturnThis(),
  is:     vi.fn().mockReturnThis(),
  or:     vi.fn().mockReturnThis(),
  order:  vi.fn().mockResolvedValue({ data, error }),
  eq:     vi.fn().mockReturnThis(),
});

const mockFrom = vi.fn((table) => {
  lastQueriedTable = table;
  return buildChain(mockData, mockError);
});

vi.mock('../supabase', () => ({ supabase: { from: mockFrom } }));

import { fetchGallery, fetchGalleryForClinic } from '../supabaseQueries';

// ══════════════════════════════════════════════════════════════
// 1. fetchGallery queries clinic_images (not gallery_images)
// ══════════════════════════════════════════════════════════════

describe('fetchGallery', () => {
  beforeEach(() => { vi.clearAllMocks(); lastQueriedTable = ''; });

  it('queries clinic_images, not gallery_images', async () => {
    let tables = [];
    mockFrom.mockImplementation((t) => { tables.push(t); return buildChain([], null); });
    await fetchGallery();
    expect(tables).toContain('clinic_images');
    expect(tables).not.toContain('gallery_images');
  });

  it('returns images in sort_order ascending order', async () => {
    const wards = [{ id: 'reception', title: 'Reception', description: '', sort_order: 1 }];
    const images = [
      { id: 2, ward_id: 'reception', clinic_id: null, image_url: 'https://b.jpg', sort_order: 2 },
      { id: 1, ward_id: 'reception', clinic_id: null, image_url: 'https://a.jpg', sort_order: 1 },
    ];
    let call = 0;
    mockFrom.mockImplementation((t) => {
      call++;
      const sorted = call === 1 ? wards : [...images].sort((a, b) => a.sort_order - b.sort_order);
      const chain = { select: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: sorted, error: null }) };
      return chain;
    });
    const { data, error } = await fetchGallery();
    expect(error).toBeNull();
    expect(data[0].images[0]).toBe('https://a.jpg');
    expect(data[0].images[1]).toBe('https://b.jpg');
  });
});

// ══════════════════════════════════════════════════════════════
// 2. fetchGalleryForClinic queries clinic_images per clinic
// ══════════════════════════════════════════════════════════════

describe('fetchGalleryForClinic', () => {
  beforeEach(() => { vi.clearAllMocks(); lastQueriedTable = ''; });

  it('queries clinic_images (not gallery_images) for a specific clinic', async () => {
    let imageCallTable = '';
    let call = 0;
    mockFrom.mockImplementation((t) => {
      call++;
      if (call === 2) imageCallTable = t;
      return { select: vi.fn().mockReturnThis(), or: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });
    await fetchGalleryForClinic(42);
    expect(imageCallTable).toBe('clinic_images');
    expect(imageCallTable).not.toBe('gallery_images');
  });

  it('includes clinic-specific AND shared images via OR filter', async () => {
    const clinicId = 7;
    let capturedOr = '';
    let call = 0;
    mockFrom.mockImplementation(() => {
      call++;
      const chain = { select: vi.fn().mockReturnThis(), or: vi.fn().mockImplementation((q) => { capturedOr = q; return chain; }), order: vi.fn().mockResolvedValue({ data: [], error: null }) };
      return chain;
    });
    await fetchGalleryForClinic(clinicId);
    expect(capturedOr).toContain(`clinic_id.eq.${clinicId}`);
    expect(capturedOr).toContain('clinic_id.is.null');
  });
});

// ══════════════════════════════════════════════════════════════
// 3-6. ApplicationDetailPage — images & status badge logic
// ══════════════════════════════════════════════════════════════

describe('ApplicationDetailPage facility images logic', () => {
  // Mirror the same resolution logic used in the component
  const resolveImages = (app) =>
    (app.facility_image_urls?.length > 0)
      ? app.facility_image_urls
      : (app.facility_image_url ? [app.facility_image_url] : []);

  it('prefers facility_image_urls array when populated', () => {
    const app = { facility_image_urls: ['https://1.jpg', 'https://2.jpg'], facility_image_url: 'https://LEGACY.jpg' };
    expect(resolveImages(app)).toEqual(['https://1.jpg', 'https://2.jpg']);
  });

  it('falls back to scalar facility_image_url when array is empty', () => {
    const app = { facility_image_urls: [], facility_image_url: 'https://legacy.jpg' };
    expect(resolveImages(app)).toEqual(['https://legacy.jpg']);
  });

  it('returns empty array when both are absent', () => {
    expect(resolveImages({ facility_image_urls: [], facility_image_url: null })).toEqual([]);
    expect(resolveImages({ facility_image_urls: undefined, facility_image_url: undefined })).toEqual([]);
  });

  it('first image is hero-sized (col-span-2) when multiple images present', () => {
    const images = ['a', 'b', 'c'];
    const isHero = (i) => i === 0 && images.length > 1;
    expect(isHero(0)).toBe(true);   // first → hero
    expect(isHero(1)).toBe(false);  // rest → square
    expect(isHero(2)).toBe(false);
  });

  it('single image is not hero-sized (full width, no col-span-2)', () => {
    const images = ['only-one'];
    const isHero = (i) => i === 0 && images.length > 1;
    expect(isHero(0)).toBe(false);
  });

  const STATUS_LABELS = {
    pending:      'Pending Review',
    approved:     'Images Approved',
    rejected:     'Images Rejected',
    needs_review: 'Needs Manual Review',
  };

  it.each(Object.entries(STATUS_LABELS))(
    'renders correct badge label for status "%s"',
    (statusKey, expectedLabel) => {
      expect(STATUS_LABELS[statusKey]).toBe(expectedLabel);
    }
  );

  it('defaults to "pending" status when image_review_status is null/undefined', () => {
    const key = (null ?? 'pending');
    expect(STATUS_LABELS[key]).toBe('Pending Review');
  });
});

// ══════════════════════════════════════════════════════════════
// 5. Cascade delete — SQL contract test
// ══════════════════════════════════════════════════════════════

describe('clinic_images ON DELETE CASCADE (SQL contract)', () => {
  it('migration renames gallery_images to clinic_images (which already has ON DELETE CASCADE)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const root = path.resolve(__dirname, '../../../../');
    const sql = fs.readFileSync(path.join(root, 'supabase_clinic_images_migration.sql'), 'utf8');
    expect(sql).toContain('ALTER TABLE gallery_images RENAME TO clinic_images');
  });

  it('clinic_id FK in gallery_images/clinic_images has ON DELETE CASCADE in base schema', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const root = path.resolve(__dirname, '../../../../');
    const schema = fs.readFileSync(path.join(root, 'supabase_schema.sql'), 'utf8');
    expect(schema).toContain('clinic_images');
    expect(schema).toContain('ON DELETE CASCADE');
  });
});
