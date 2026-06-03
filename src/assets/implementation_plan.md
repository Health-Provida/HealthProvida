# Replace Hardcoded Dummy Data with Supabase Backend

This plan covers the systematic replacement of all hardcoded/mock data across the HealthProvida frontend with live Supabase queries.

## Audit Summary

| File | Hardcoded Data Found | Supabase Table(s) |
|---|---|---|
| `ClinicGrid.jsx` | `clinicsData` (9 clinics), `commonGallery` (5 wards) | `clinics`, `clinic_tags`, `clinic_specialties`, `clinic_equipment`, `clinic_hmos`, `reviews`, `gallery_wards`, `gallery_images` |
| `ClinicPage.jsx` | `operatingHoursData`, reads `clinicsData` | `clinic_operating_hours`, `appointment_slots` |
| `ClinicPhotosPage.jsx` | Reads `clinicsData`, `commonGallery` | `gallery_wards`, `gallery_images` |
| `MapPage.jsx` | `clinicPins` (9 pins), reads `clinicsData` | `clinics` (map_pin_x/y fields) |
| `MapSection.jsx` | `mapPins` (5 pins) | `clinics` (map_pin_x/y fields) |
| `ClinicSid.jsx` | Reads `clinicsData` | `clinics` |
| `SearchSection.jsx` | `categories` with fake counts | `clinics` (aggregate by category) |
| `Hero.jsx` | Stat strings ("200+ Providers", etc.) | `clinics`, `reviews`, `hmos` (counts) |
| `ProfileSidebar.jsx` | `user` object, `appointments`, `healthRecords` | `profiles`, `appointments` |
| `JoinProviderPage.jsx` | `hmoOptions` (already uses Supabase for submission) | `hmos` |
| `FavoritesContext.jsx` | `getFavoriteClinics` reads `clinicsData` | `clinics` |
| `ContactPage.jsx` | ✅ Already integrated | — |

## User Review Required

> [!IMPORTANT]
> **Static marketing content**: The following files contain hardcoded content that appears to be **marketing/informational** rather than dynamic data. I recommend keeping these as static content unless you have a CMS or Supabase table for them:
> - `AboutPage.jsx` — team members, company stats, values
> - `ServicesPage.jsx` — service categories and procedure descriptions
> - `CallToAction.jsx`, `Footer.jsx`, `Header.jsx` — site chrome

> [!IMPORTANT]
> **ProfileSidebar.jsx**: Contains hardcoded user data and appointments. This requires **authentication** to be implemented (the user must be logged in to fetch their profile and appointments). Currently there's no auth flow in the app. Should I:
> - **(A)** Wire up the Supabase auth session and show real data when logged in, with a fallback/placeholder when not?
> - **(B)** Skip the ProfileSidebar for now since auth isn't in place?

> [!WARNING]
> **`healthRecords`** in ProfileSidebar.jsx has no matching Supabase table in your schema. This data will remain as a static placeholder unless you create a `health_records` table.

## Open Questions

> [!IMPORTANT]
> 1. **Clinic images** (`image_url`): The `clinics` table has an `image_url` column but the seed data doesn't populate it. The frontend currently uses locally imported PNG files (`imageone.png`, `imagetwo.png`, etc.). Should I:
>    - **(A)** Upload these images to Supabase Storage and set the `image_url` values? (Requires Supabase Storage bucket setup)
>    - **(B)** Keep using local images as a fallback when `image_url` is null/empty?
>    - **(C)** Both — use `image_url` from Supabase when available, fall back to a default image?
> 
> 2. **Gallery local images**: The `commonGallery` array includes both local imports (generated PNGs) and Unsplash URLs. The seed data only has the Unsplash URLs. Should I upload the local gallery images to Supabase Storage too, or keep the hybrid approach?

## Proposed Changes

### Phase 1: Core Data Layer — Supabase Hooks & Clinic Data Service

#### [NEW] [supabaseQueries.js](file:///c:/Users/achon/Desktop/HealthProvida/src/utils/supabaseQueries.js)
Create a centralized data-fetching module with reusable async functions:
- `fetchClinics()` — fetches all clinics with their tags, specialties, equipment, HMOs (joined), and reviews
- `fetchClinicById(id)` — fetches a single clinic with all related data
- `fetchGallery()` — fetches gallery wards + images
- `fetchGalleryForClinic(clinicId)` — fetches gallery for a specific clinic
- `fetchClinicOperatingHours(clinicId)` — fetches operating hours
- `fetchAppointmentSlots(clinicId)` — fetches available appointment slots
- `fetchMapPins()` — fetches clinic map pin data
- `fetchHMOs()` — fetches all HMOs
- `fetchCategoryCounts()` — fetches clinic counts grouped by `practitioner_category`
- `fetchStats()` — fetches aggregate stats (provider count, review count, HMO count)

---

### Phase 2: ClinicGrid.jsx — The Central Data Source

#### [MODIFY] [ClinicGrid.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/components/ClinicGrid.jsx)
- Remove the hardcoded `clinicsData` array (lines 86–321) and `commonGallery` array (lines 29–83)
- Add `useState` + `useEffect` to fetch clinics from Supabase on mount via `fetchClinics()`
- Add `loading` and `error` states with appropriate UI (skeleton cards, error message)
- Continue exporting a `useClinics` hook or context so child components can access the data
- Keep the local image imports as fallbacks for clinics missing `image_url`

---

### Phase 3: Context Update

#### [MODIFY] [FavoritesContext.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/context/FavoritesContext.jsx)
- Remove import of `clinicsData` from ClinicGrid
- Accept a `clinics` prop or use a new `ClinicsContext` to get dynamic clinic data
- `getFavoriteClinics` will filter from the dynamically-fetched clinics list

#### [NEW] [ClinicsContext.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/context/ClinicsContext.jsx)
- Create a top-level context that fetches all clinics once and provides them to the entire app
- Provides `clinics`, `loading`, `error`, and `refetch` to all consumers
- This replaces all the `import { clinicsData }` patterns across the codebase

---

### Phase 4: Page-Level Refactoring

#### [MODIFY] [ClinicPage.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/pages/ClinicPage.jsx)
- Remove `operatingHoursData` (lines 7–49)
- Use `fetchClinicById(id)` instead of `clinicsData.find(...)`
- Fetch operating hours via `fetchClinicOperatingHours(clinicId)`
- Fetch appointment slots via `fetchAppointmentSlots(clinicId)` — replace hardcoded `timeSlots`
- Fetch gallery via `fetchGallery()`
- Fetch reviews from the joined clinic data
- Add loading/error states

#### [MODIFY] [ClinicPhotosPage.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/pages/ClinicPhotosPage.jsx)
- Remove import of `clinicsData` and `commonGallery`
- Fetch clinic name via `fetchClinicById(id)`
- Fetch gallery via `fetchGallery()`
- Add loading/error states

#### [MODIFY] [MapPage.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/pages/MapPage.jsx)
- Remove hardcoded `clinicPins` array (lines 12–65)
- Use `ClinicsContext` for clinic data
- Derive map pins from clinic `map_pin_x`/`map_pin_y` fields
- Add loading state

#### [MODIFY] [FavoritesPage.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/pages/FavoritesPage.jsx)
- Will work automatically once FavoritesContext and ClinicsContext are updated

---

### Phase 5: Component-Level Refactoring

#### [MODIFY] [ClinicSid.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/components/ClinicSid.jsx)
- Remove import of `clinicsData`
- Use `ClinicsContext` to get clinics
- Add loading state

#### [MODIFY] [MapSection.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/components/MapSection.jsx)
- Remove hardcoded `mapPins` (lines 8–20)
- Use `ClinicsContext` to derive map pins
- Add loading state

#### [MODIFY] [SearchSection.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/components/SearchSection.jsx)
- Remove hardcoded `categories` array (lines 6–40)
- Fetch category counts via `fetchCategoryCounts()` or derive from `ClinicsContext`
- Add loading state

#### [MODIFY] [Hero.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/components/Hero.jsx)
- Replace hardcoded stat strings with dynamic counts from `fetchStats()`
- Add loading state for the stats

#### [MODIFY] [JoinProviderPage.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/pages/JoinProviderPage.jsx)
- Replace hardcoded `hmoOptions` with dynamic fetch from `hmos` table
- Keep `practitionerTypes` hardcoded (they mirror the DB enum)
- Keep tag/specialty/equipment options hardcoded (no lookup table for these)

---

### Phase 6: App.jsx Integration

#### [MODIFY] [App.jsx](file:///c:/Users/achon/Desktop/HealthProvida/src/App.jsx)
- Wrap app with `ClinicsProvider` context
- This ensures all components have access to dynamic clinic data

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify no compilation errors
- Run the dev server (`npm run dev`) and verify in browser:
  - Home page loads clinics dynamically
  - Clinic detail page shows correct data
  - Gallery page shows images
  - Map page shows pins
  - Favorites still work
  - Search/filter works
  - JoinProvider form loads HMOs from DB
  - Contact form still works

### Manual Verification
- Check browser DevTools Network tab to confirm Supabase API calls are being made
- Verify no console errors
- Verify loading states appear briefly while data loads
- Verify error states render correctly (can test by temporarily breaking the Supabase URL)
