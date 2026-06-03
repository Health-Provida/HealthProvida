/**
 * supabaseQueries.js
 * ──────────────────────────────────────────────────────────────
 * Centralised Supabase data-fetching layer for HealthProvida.
 *
 * Every public-facing query function:
 *   • Returns `{ data, error }` so callers can handle both paths.
 *   • Shapes the response to match the format the existing UI
 *     components already expect (e.g. `tags`, `specialties`,
 *     `equipment`, `supportedHMOs`, `reviewHighlights`).
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from './supabase';

// ─── Local image fallback map ───────────────────────────────
// Clinic IDs 1-9 have local PNGs bundled with the app.
// When `image_url` is null/empty in the DB we fall back to these.
import imageone from '../components/ui/imageone.png';
import imagetwo from '../components/ui/imagetwo.png';
import imagethree from '../components/ui/imagethree.png';
import imagefour from '../components/ui/imagefour.png';
import imagefive from '../components/ui/imagefive.png';
import imagesix from '../components/ui/imagesix.png';
import imageseven from '../components/ui/imageseven.png';
import imageeight from '../components/ui/imageeight.png';
import imagenine from '../components/ui/imagenine.png';

const LOCAL_IMAGE_MAP = {
  1: imageone,
  2: imagetwo,
  3: imagethree,
  4: imagefour,
  5: imagefive,
  6: imagesix,
  7: imageseven,
  8: imageeight,
  9: imagenine,
};

/**
 * Default fallback image used when a clinic has no `image_url`
 * AND no entry in LOCAL_IMAGE_MAP.
 */
const DEFAULT_CLINIC_IMAGE = imageone;

// ─── Internal helpers ───────────────────────────────────────

/**
 * Resolve the image for a clinic row, preferring:
 *   1. `image_url` from the DB
 *   2. A bundled local image keyed by clinic ID
 *   3. A generic default
 */
function resolveClinicImage(clinic) {
  if (clinic.image_url) return clinic.image_url;
  return LOCAL_IMAGE_MAP[clinic.id] ?? DEFAULT_CLINIC_IMAGE;
}

/**
 * Transform a raw clinic row (with joined sub-tables) into the
 * shape the UI expects.  The Supabase `.select()` uses embedded
 * resource syntax so sub-tables arrive as arrays of objects.
 */
function shapeClinic(row) {
  return {
    id: row.id,
    image_src: resolveClinicImage(row),
    image_url: row.image_url,
    practitioner_name: row.practitioner_name,
    practice_type: row.practice_type,
    practitioner_category: row.practitioner_category,
    address: row.address,
    phone: row.phone,
    email: row.email,
    rating: parseFloat(row.rating) || 0,
    number_of_reviews: row.number_of_reviews ?? 0,
    distance_from_location: row.distance_from_location ?? '',
    nextAvailable: row.next_available ?? '',
    is_verified: row.is_verified ?? false,
    map_pin_x: row.map_pin_x != null ? parseFloat(row.map_pin_x) : null,
    map_pin_y: row.map_pin_y != null ? parseFloat(row.map_pin_y) : null,

    // Sub-table arrays → flat string arrays matching current UI expectations
    tags: (row.clinic_tags ?? []).map((t) => t.tag),
    specialties: (row.clinic_specialties ?? []).map((s) => s.specialty),
    equipment: (row.clinic_equipment ?? []).map((e) => e.equipment_name),
    supportedHMOs: (row.clinic_hmos ?? []).map((ch) => ch.hmos?.name).filter(Boolean),

    // Reviews → reviewHighlights (matching existing component expectations)
    reviewHighlights: (row.reviews ?? []).map((r) => ({
      author: r.author_name,
      rating: r.rating,
      date: r.review_date ?? '',
      text: r.review_text,
      is_verified: r.is_verified ?? false,
    })),

    // Keep timeSlots as an empty array — will be populated per-clinic
    // when fetchClinicById or fetchAppointmentSlots is called.
    timeSlots: [],
  };
}

// ─── Shared select string ───────────────────────────────────
// Supabase PostgREST embedded resource syntax to pull all
// related data in a single round-trip.
const CLINIC_SELECT = `
  *,
  clinic_tags ( tag ),
  clinic_specialties ( specialty ),
  clinic_equipment ( equipment_name ),
  clinic_hmos ( hmos ( name ) ),
  reviews ( id, author_name, rating, review_text, review_date, is_verified )
`;

// ═════════════════════════════════════════════════════════════
//  PUBLIC API
// ═════════════════════════════════════════════════════════════

/**
 * Fetch ALL active clinics with tags, specialties, equipment,
 * HMOs, and reviews joined.
 *
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchClinics() {
  const { data, error } = await supabase
    .from('clinics')
    .select(CLINIC_SELECT)
    .eq('is_active', true)
    .order('id', { ascending: true });

  if (error) return { data: null, error };

  return { data: data.map(shapeClinic), error: null };
}

/**
 * Fetch a single clinic by ID, with all related data.
 *
 * @param {number|string} id
 * @returns {{ data: Object|null, error: Error|null }}
 */
export async function fetchClinicById(id) {
  const { data, error } = await supabase
    .from('clinics')
    .select(CLINIC_SELECT)
    .eq('id', Number(id))
    .single();

  if (error) return { data: null, error };

  const shaped = shapeClinic(data);

  // Also pull appointment slots and operating hours in parallel
  const [slotsResult, hoursResult] = await Promise.all([
    fetchAppointmentSlots(id),
    fetchClinicOperatingHours(id),
  ]);

  if (slotsResult.data) {
    shaped.timeSlots = slotsResult.data;
  }
  if (hoursResult.data) {
    shaped.operatingHours = hoursResult.data;
  }

  return { data: shaped, error: null };
}

/**
 * Fetch gallery wards with their images.
 * Returns data shaped like the existing `commonGallery` array.
 *
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchGallery() {
  const { data: wards, error: wardsError } = await supabase
    .from('gallery_wards')
    .select('id, title, description, sort_order')
    .order('sort_order', { ascending: true });

  if (wardsError) return { data: null, error: wardsError };

  const { data: images, error: imagesError } = await supabase
    .from('gallery_images')
    .select('id, ward_id, clinic_id, image_url, sort_order')
    .is('clinic_id', null) // shared/common images only
    .order('sort_order', { ascending: true });

  if (imagesError) return { data: null, error: imagesError };

  // Group images by ward and build the gallery structure
  const imagesByWard = {};
  for (const img of images) {
    if (!imagesByWard[img.ward_id]) imagesByWard[img.ward_id] = [];
    imagesByWard[img.ward_id].push(img.image_url);
  }

  const gallery = wards.map((ward) => ({
    id: ward.id,
    title: ward.title,
    description: ward.description,
    images: imagesByWard[ward.id] ?? [],
  }));

  return { data: gallery, error: null };
}

/**
 * Fetch gallery for a specific clinic.
 * Falls back to shared/common images when a clinic has none.
 *
 * @param {number|string} clinicId
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchGalleryForClinic(clinicId) {
  const { data: wards, error: wardsError } = await supabase
    .from('gallery_wards')
    .select('id, title, description, sort_order')
    .order('sort_order', { ascending: true });

  if (wardsError) return { data: null, error: wardsError };

  // Fetch both clinic-specific AND shared images
  const { data: images, error: imagesError } = await supabase
    .from('gallery_images')
    .select('id, ward_id, clinic_id, image_url, sort_order')
    .or(`clinic_id.eq.${Number(clinicId)},clinic_id.is.null`)
    .order('sort_order', { ascending: true });

  if (imagesError) return { data: null, error: imagesError };

  // Group images by ward, preferring clinic-specific over shared
  const imagesByWard = {};
  for (const img of images) {
    if (!imagesByWard[img.ward_id]) imagesByWard[img.ward_id] = [];
    imagesByWard[img.ward_id].push(img.image_url);
  }

  const gallery = wards.map((ward) => ({
    id: ward.id,
    title: ward.title,
    description: ward.description,
    images: imagesByWard[ward.id] ?? [],
  }));

  return { data: gallery, error: null };
}

/**
 * Fetch operating hours for a specific clinic.
 *
 * @param {number|string} clinicId
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchClinicOperatingHours(clinicId) {
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const { data, error } = await supabase
    .from('clinic_operating_hours')
    .select('day, is_open, open_time, close_time')
    .eq('clinic_id', Number(clinicId));

  if (error) return { data: null, error };

  // Sort by day of week and format times
  const sorted = (data ?? []).sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  const hours = sorted.map((row) => ({
    day: row.day,
    isOpen: row.is_open,
    openTime: row.open_time ? row.open_time.slice(0, 5) : null,  // "08:00"
    closeTime: row.close_time ? row.close_time.slice(0, 5) : null,
  }));

  return { data: hours, error: null };
}

/**
 * Fetch available (un-booked) appointment slots for a clinic.
 * Groups them by date in a shape matching the existing `timeSlots`
 * array: `[{ day: "Today", slots: ["2:00 PM", …] }]`
 *
 * @param {number|string} clinicId
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchAppointmentSlots(clinicId) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

  const { data, error } = await supabase
    .from('appointment_slots')
    .select('slot_date, slot_time, is_booked, duration_minutes')
    .eq('clinic_id', Number(clinicId))
    .eq('is_booked', false)
    .gte('slot_date', todayStr)
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true });

  if (error) return { data: null, error };

  // Group by date and format as friendly labels
  const grouped = {};
  for (const slot of (data ?? [])) {
    const dateKey = slot.slot_date;
    if (!grouped[dateKey]) grouped[dateKey] = [];

    // Convert "14:00:00" → "2:00 PM"
    const timeStr = formatTime(slot.slot_time);
    grouped[dateKey].push(timeStr);
  }

  // Convert to array with day labels
  const timeSlots = Object.entries(grouped).map(([dateStr, slots]) => ({
    day: getDayLabel(dateStr, todayStr),
    date: dateStr,
    slots,
  }));

  return { data: timeSlots, error: null };
}

/**
 * Fetch clinic data needed for map pins.
 *
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchMapPins() {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, practitioner_name, practice_type, address, rating, number_of_reviews, map_pin_x, map_pin_y, image_url')
    .eq('is_active', true)
    .not('map_pin_x', 'is', null)
    .not('map_pin_y', 'is', null);

  if (error) return { data: null, error };

  const pins = (data ?? []).map((c) => ({
    id: c.id,
    name: c.practitioner_name,
    type: c.practice_type,
    address: c.address,
    rating: parseFloat(c.rating) || 0,
    reviews: c.number_of_reviews ?? 0,
    x: parseFloat(c.map_pin_x),
    y: parseFloat(c.map_pin_y),
    image: c.image_url || LOCAL_IMAGE_MAP[c.id] || DEFAULT_CLINIC_IMAGE,
  }));

  return { data: pins, error: null };
}

/**
 * Fetch all HMOs (for the JoinProvider form, etc.).
 *
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchHMOs() {
  const { data, error } = await supabase
    .from('hmos')
    .select('id, name, logo_url, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) return { data: null, error };

  return { data: data ?? [], error: null };
}

/**
 * Fetch clinic counts grouped by `practitioner_category`.
 * Used by SearchSection for category cards.
 *
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchCategoryCounts() {
  // Supabase JS client doesn't support GROUP BY natively,
  // so we fetch minimal data and aggregate client-side.
  const { data, error } = await supabase
    .from('clinics')
    .select('practitioner_category')
    .eq('is_active', true);

  if (error) return { data: null, error };

  const counts = {};
  for (const row of (data ?? [])) {
    const cat = row.practitioner_category;
    counts[cat] = (counts[cat] || 0) + 1;
  }

  // Convert to array for easy consumption
  const categories = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
  }));

  return { data: categories, error: null };
}

/**
 * Fetch aggregate stats for the Hero section:
 *   - Total provider count
 *   - Total review count
 *   - Total HMO count
 *
 * @returns {{ data: Object|null, error: Error|null }}
 */
export async function fetchStats() {
  // Run three lightweight count queries in parallel
  const [clinicsRes, reviewsRes, hmosRes] = await Promise.all([
    supabase.from('clinics').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.from('hmos').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  const error = clinicsRes.error || reviewsRes.error || hmosRes.error;
  if (error) return { data: null, error };

  return {
    data: {
      providerCount: clinicsRes.count ?? 0,
      reviewCount: reviewsRes.count ?? 0,
      hmoCount: hmosRes.count ?? 0,
    },
    error: null,
  };
}

// ─── Formatting utilities ───────────────────────────────────

/**
 * Convert a 24-h time string like "14:00:00" to "2:00 PM".
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hh, mm] = timeStr.split(':');
  let hour = parseInt(hh, 10);
  const minute = mm;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

/**
 * Return a friendly day label for a date string relative to today.
 *   - Same day → "Today"
 *   - Next day → "Tomorrow"
 *   - Otherwise → weekday name (e.g. "Wednesday")
 */
function getDayLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return 'Today';

  const today = new Date(todayStr + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  const diffMs = target - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Tomorrow';

  return target.toLocaleDateString('en-US', { weekday: 'long' });
}
