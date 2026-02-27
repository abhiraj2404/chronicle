import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Uploads a file buffer to Cloudinary
 * @param buffer The file buffer to upload
 * @returns Promise resolving to the Cloudinary UploadApiResponse
 */
export async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' }, // Auto-detects image vs video
            (error, result) => {
                if (error || !result) {
                    console.error('Cloudinary stream error:', error)
                    reject(error || new Error('Upload failed without a specific error'))
                } else {
                    resolve(result)
                }
            }
        )

            // Write the buffer to the stream and trigger the upload
            ; (uploadStream as any).end(buffer)
    })
}

export { cloudinary }
