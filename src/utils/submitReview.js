/**
 * submitReview.js
 * ──────────────────────────────────────────────────────────────
 * Handles creating and updating patient reviews in Supabase.
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from './supabase';

const NO_CLIENT_ERROR = { message: 'Supabase client is not configured.' };

/**
 * Format current date as "Month YYYY" (e.g. "June 2026")
 */
function getHumanReviewDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Submit a new review for a clinic.
 *
 * @param {{ clinicId: number, patientId: string, authorName: string, rating: number, reviewText: string }} params
 * @returns {{ data: object|null, error: object|null }}
 */
export async function submitReview({ clinicId, patientId, authorName, rating, reviewText }) {
  if (!supabase) return { data: null, error: NO_CLIENT_ERROR };

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      clinic_id: Number(clinicId),
      patient_id: patientId,
      author_name: authorName,
      rating,
      review_text: reviewText,
      review_date: getHumanReviewDate(),
      is_verified: true,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update an existing review.
 *
 * @param {{ reviewId: number, rating: number, reviewText: string }} params
 * @returns {{ data: object|null, error: object|null }}
 */
export async function updateReview({ reviewId, rating, reviewText }) {
  if (!supabase) return { data: null, error: NO_CLIENT_ERROR };

  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating,
      review_text: reviewText,
      review_date: getHumanReviewDate(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  return { data, error };
}
