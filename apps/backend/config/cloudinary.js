const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Compress and upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} folder - Cloudinary folder (e.g., 'quiz/images')
 * @param {string} originalName - Original filename
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadImage(fileBuffer, folder = 'quiz/images', originalName = 'image') {
  try {
    // Compress image using sharp
    const compressedBuffer = await sharp(fileBuffer)
      .resize(1920, 1080, { // Max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true }) // Convert to JPEG with 85% quality
      .toBuffer();

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          public_id: `${Date.now()}_${originalName.replace(/\.[^.]+$/, '')}`,
          overwrite: false,
          transformation: [
            { fetch_format: 'auto', quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      const readableStream = Readable.from(compressedBuffer);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
}

/**
 * Upload audio file to Cloudinary (no compression, direct upload)
 * @param {Buffer} fileBuffer - Audio file buffer
 * @param {string} folder - Cloudinary folder (e.g., 'quiz/sounds')
 * @param {string} originalName - Original filename
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadAudio(fileBuffer, folder = 'quiz/sounds', originalName = 'audio') {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          public_id: `${Date.now()}_${originalName.replace(/\.[^.]+$/, '')}`,
          overwrite: false
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      const readableStream = Readable.from(fileBuffer);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    throw new Error('Failed to upload audio: ' + error.message);
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image' or 'video' (for audio)
 */
async function deleteFile(publicId, resourceType = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  cloudinary,
  uploadImage,
  uploadAudio,
  deleteFile
};