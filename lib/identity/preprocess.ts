import sharp from 'sharp';

/**
 * Preprocesses an ID image for better OCR extraction.
 * Converts to grayscale, normalizes, and resizes to standard width.
 * @param buffer - Original image buffer
 * @returns Preprocessed image buffer
 */
export async function preprocessIDImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(1200, null, { // Resize to width 1200, auto height
      withoutEnlargement: true,
    })
    .grayscale() // Convert to grayscale
    .normalize() // Enhance contrast
    .toBuffer();
}
