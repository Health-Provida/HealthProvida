/**
 * submitProviderApplication.js
 * ──────────────────────────────────────────────────────────────
 * Handles submission of the provider application form to Supabase.
 * Uploads facility image to storage if provided, then inserts
 * the application into the provider_applications table.
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from './supabase';

// Maps the form's display labels → valid practitioner_type enum values in the DB
const PRACTITIONER_TYPE_MAP = {
  'Multi-specialty Clinic / General Practice': 'Clinic',
  'General Hospital / Specialist Care':        'Hospital',
  'Tertiary Care Hospital / National Referral Center': 'Hospital',
  'Private Multi-specialty Clinic':            'Clinic',
  'Fertility & Reproductive Health Clinic':    'Specialist Center',
  'Reproductive Health & Family Planning Clinic': 'Specialist Center',
  'General Private Hospital':                  'Hospital',
  'Private General Hospital':                  'Hospital',
  'Specialist Surgical Hospital':              'Specialist Center',
  'Diagnostic Center':                         'Diagnostic Center',
  'Pharmacy':                                  'Pharmacy',
  'Dental Clinic':                             'Dental Clinic',
  // DB enum values pass through unchanged
  'Hospital':          'Hospital',
  'Clinic':            'Clinic',
  'Specialist Center': 'Specialist Center',
};

/**
 * Submit a provider application to the database.
 *
 * @param {Object} formData - The complete form data from JoinProviderPage
 * @param {string} formData.practitionerName
 * @param {string} formData.practitionerType
 * @param {string} formData.email
 * @param {string} formData.phone
 * @param {string} formData.address
 * @param {string[]} formData.specialties
 * @param {string[]} formData.equipment
 * @param {string[]} formData.tags
 * @param {string[]} formData.supportedHMOs
 * @param {Array<{file: File, preview: string}>} formData.facilityImages - multiple facility photos (min 4)
 * @param {Array} formData.operatingHours
 * @param {string} formData.appointmentSlotDuration
 * @returns {Promise<{success: boolean, applicationId?: string, error?: string}>}
 */
export async function submitProviderApplication(formData) {
  if (!supabase) {
    return { success: false, error: 'Database connection not configured.' };
  }

  try {
    // Upload facility images if provided
    const facilityImageUrls = [];
    if (Array.isArray(formData.facilityImages) && formData.facilityImages.length > 0) {
      for (const { file } of formData.facilityImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
        const filePath = `applications/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('provider-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Continue without this image — don't block the application
        } else {
          const { data: urlData } = supabase.storage
            .from('provider-uploads')
            .getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            facilityImageUrls.push(urlData.publicUrl);
          }
        }
      }
    }

    // Get the current user's ID if they're logged in
    const { data: { user } } = await supabase.auth.getUser();
    const applicantId = user?.id ?? null;

    // Build the application row
    const applicationData = {
      applicant_id: applicantId,
      practitioner_name: formData.practitionerName.trim(),
      practitioner_type: PRACTITIONER_TYPE_MAP[formData.practitionerType] ?? formData.practitionerType,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      specialties: formData.specialties || [],
      equipment: formData.equipment || [],
      tags: formData.tags || [],
      supported_hmos: formData.supportedHMOs || [],
      facility_image_url: facilityImageUrls[0] ?? null,        // keep first for backwards compat
      facility_image_urls: facilityImageUrls,                  // all images
      operating_hours: formData.operatingHours || [],
      appointment_slot_duration: parseInt(formData.appointmentSlotDuration, 10) || 30,
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('provider_applications')
      .insert([applicationData])
      .select('id')
      .single();

    if (error) {
      console.error('Application submission failed:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to submit application. Please try again.' 
      };
    }

    return { 
      success: true, 
      applicationId: data.id 
    };
  } catch (err) {
    console.error('Application submission exception:', err);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    };
  }
}
