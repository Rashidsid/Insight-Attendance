// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'dfyjflaxx',
  apiKey: '257859162855456',
  uploadPreset: 'insight_attendance', // Must be created in Cloudinary as unsigned
};

// Cloudinary upload URL for unsigned uploads
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

/**
 * Upload image to Cloudinary using unsigned upload preset
 * @param base64Data - Base64 encoded image data
 * @param imageName - Name for the image (used in public_id)
 * @returns Promise<string> - Download URL of uploaded image
 */
export const uploadToCloudinary = async (
  base64Data: string,
  imageName: string
): Promise<string> => {
  try {
    console.log(`[Cloudinary] Uploading ${imageName}...`);

    // Create FormData for upload
    const formData = new FormData();
    
    // Convert base64 to blob
    const base64String = base64Data.split(',')[1] || base64Data;
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Add required fields for unsigned upload
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('public_id', imageName);
    formData.append('resource_type', 'image');

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Cloudinary] Error response:', errorData);
      throw new Error(`Cloudinary upload failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(`[Cloudinary] ${imageName} uploaded successfully:`, data.secure_url);

    return data.secure_url; // Return the secure HTTPS URL
  } catch (error) {
    console.error(`[Cloudinary] Error uploading ${imageName}:`, error);
    throw error;
  }
};
