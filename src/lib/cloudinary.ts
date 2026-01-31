import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
}

/**
 * Upload a poster image to Cloudinary
 * @param base64Image - Base64 encoded image data
 * @param studentName - Student name for folder organization
 * @param className - Class name for folder organization
 * @returns Promise with secure URL and public ID
 */
export async function uploadPosterToCloudinary(
    base64Image: string,
    studentName: string,
    className: string
): Promise<CloudinaryUploadResult> {
    try {
        // Clean up student name for folder path (remove spaces, special chars)
        const cleanStudentName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
        const cleanClassName = className.replace(/[^a-zA-Z0-9]/g, '_');

        // Upload to Cloudinary with organized folder structure
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: `makerfest-posters/${cleanClassName}/${cleanStudentName}`,
            resource_type: 'image',
            format: 'png',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new Error('Failed to upload poster to Cloudinary');
    }
}

export default cloudinary;
