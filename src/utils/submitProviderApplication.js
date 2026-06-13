/**
 * submitProviderApplication.js
 * ──────────────────────────────────────────────────────────────
 * Handles submission of the provider application form to Supabase.
 * Uploads facility image to storage if provided, then inserts
 * the application into the provider_applications table.
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from './supabase';

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
 * @param {File|null} formData.facilityImage
 * @param {Array} formData.operatingHours
 * @param {string} formData.appointmentSlotDuration
 * @returns {Promise<{success: boolean, applicationId?: string, error?: string}>}
 */
export async function submitProviderApplication(formData) {
  if (!supabase) {
    return { success: false, error: 'Database connection not configured.' };
  }

  try {
    let facilityImageUrl = null;

    // Upload facility image if provided
    if (formData.facilityImage) {
      const file = formData.facilityImage;
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
        // Continue without image — don't block the application
      } else {
        const { data: urlData } = supabase.storage
          .from('provider-uploads')
          .getPublicUrl(filePath);
        facilityImageUrl = urlData?.publicUrl ?? null;
      }
    }

    // Get the current user's ID if they're logged in
    const { data: { user } } = await supabase.auth.getUser();
    const applicantId = user?.id ?? null;

    // Build the application row
    const applicationData = {
      applicant_id: applicantId,
      practitioner_name: formData.practitionerName.trim(),
      practitioner_type: formData.practitionerType,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      specialties: formData.specialties || [],
      equipment: formData.equipment || [],
      tags: formData.tags || [],
      supported_hmos: formData.supportedHMOs || [],
      facility_image_url: facilityImageUrl,
      operating_hours: JSON.stringify(formData.operatingHours || []),
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
