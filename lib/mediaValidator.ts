/**
 * Media Validation Utility for Wedding Platform (Frontend)
 * Pre-upload validation for vendor reels using Instagram Reels and TikTok standards
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    width?: number;
    height?: number;
    aspectRatio?: string;
    duration?: number;
    fps?: number;
    fileSize?: number;
    hasAudio?: boolean;
  };
}

export class MediaValidator {
  // Accepted aspect ratios
  private static readonly ACCEPTED_ASPECT_RATIOS = {
    "9:16": { width: 9, height: 16, name: "9:16 (Vertical - Recommended)" },
    "4:5": { width: 4, height: 5, name: "4:5 (Feed-safe vertical)" },
    "1:1": { width: 1, height: 1, name: "1:1 (Square)" },
  };

  // File size limits
  private static readonly MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250 MB
  private static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

  // Duration limits (seconds)
  private static readonly MIN_DURATION = 3;
  private static readonly RECOMMENDED_MIN_DURATION = 60;
  private static readonly RECOMMENDED_MAX_DURATION = 90;
  private static readonly MAX_DURATION = 120; // 2 minutes

  // Accepted formats
  private static readonly ACCEPTED_VIDEO_FORMATS = ["video/mp4"];
  private static readonly ACCEPTED_IMAGE_FORMATS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  /**
   * Calculate GCD for aspect ratio simplification
   */
  private static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * Calculate aspect ratio from dimensions
   */
  private static calculateAspectRatio(
    width: number,
    height: number
  ): { ratio: string; width: number; height: number } {
    const divisor = this.gcd(width, height);
    const ratioWidth = width / divisor;
    const ratioHeight = height / divisor;
    return {
      ratio: `${ratioWidth}:${ratioHeight}`,
      width: ratioWidth,
      height: ratioHeight,
    };
  }

  /**
   * Check if aspect ratio is accepted
   */
  private static isAspectRatioAccepted(
    width: number,
    height: number
  ): { accepted: boolean; ratio: string; message?: string } {
    const calculated = this.calculateAspectRatio(width, height);

    // Check against accepted ratios
    for (const [key, value] of Object.entries(this.ACCEPTED_ASPECT_RATIOS)) {
      if (
        calculated.width === value.width &&
        calculated.height === value.height
      ) {
        return { accepted: true, ratio: calculated.ratio };
      }
    }

    // Check for common rejected ratios
    if (calculated.ratio === "16:9") {
      return {
        accepted: false,
        ratio: calculated.ratio,
        message:
          "Horizontal videos (16:9) not allowed. Use vertical format (9:16) like Instagram Reels.",
      };
    }

    return {
      accepted: false,
      ratio: calculated.ratio,
      message: `Unsupported aspect ratio (${calculated.ratio}). Use 9:16, 4:5, or 1:1 like Instagram Reels.`,
    };
  }

  /**
   * Get video metadata using HTML5 Video API
   */
  private static getVideoMetadata(file: File): Promise<{
    width: number;
    height: number;
    duration: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error("Unable to read video file. File may be corrupted."));
      };

      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get image metadata
   */
  private static getImageMetadata(file: File): Promise<{
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Unable to read image file. File may be corrupted."));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate a reel/video file
   */
  static async validateReel(file: File): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: false,
      errors: [],
      warnings: [],
      metadata: {},
    };

    try {
      // 1. Check file type
      if (!this.ACCEPTED_VIDEO_FORMATS.includes(file.type)) {
        result.errors.push(
          `Unsupported format (${file.type}). Please upload MP4 (H.264 + AAC).`
        );
        return result;
      }

      // 2. Check file size
      if (file.size > this.MAX_VIDEO_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        result.errors.push(
          `File size (${sizeMB} MB) exceeds maximum allowed (250 MB). Please compress your video.`
        );
        return result;
      }

      // 3. Get video metadata
      let metadata;
      try {
        metadata = await this.getVideoMetadata(file);
      } catch (error: any) {
        result.errors.push(error.message || "Unable to read video metadata.");
        return result;
      }

      const { width, height, duration } = metadata;

      // 4. Validate resolution
      if (width > 1080 || height > 1920) {
        result.errors.push(
          `Invalid resolution (${width}×${height}). Maximum allowed is 1080p (1080×1920).`
        );
        return result;
      }

      // 5. Validate aspect ratio
      const aspectCheck = this.isAspectRatioAccepted(width, height);
      if (!aspectCheck.accepted) {
        result.errors.push(aspectCheck.message!);
        return result;
      }

      // 6. Validate duration
      if (duration < this.MIN_DURATION) {
        result.errors.push(
          `Video too short (${duration.toFixed(1)}s). Minimum duration is ${
            this.MIN_DURATION
          } seconds.`
        );
        return result;
      }

      if (duration > this.MAX_DURATION) {
        result.errors.push(
          `Video exceeds 2 minutes (${duration.toFixed(
            1
          )}s). Reels must be under 120 seconds.`
        );
        return result;
      }

      // Warnings for non-optimal duration
      if (duration < this.RECOMMENDED_MIN_DURATION) {
        result.warnings.push(
          `Video is ${duration.toFixed(
            1
          )}s. Recommended: 60-90 seconds for better engagement.`
        );
      } else if (duration > this.RECOMMENDED_MAX_DURATION) {
        result.warnings.push(
          `Video is ${duration.toFixed(
            1
          )}s. Recommended: 60-90 seconds for better engagement.`
        );
      }

      // All validations passed!
      result.valid = true;
      result.metadata = {
        width,
        height,
        aspectRatio: aspectCheck.ratio,
        duration,
        fileSize: file.size,
      };

      return result;
    } catch (error: any) {
      result.errors.push(
        error.message || "An unexpected error occurred during validation."
      );
      return result;
    }
  }

  /**
   * Validate an image file
   */
  static async validateImage(file: File): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: false,
      errors: [],
      warnings: [],
      metadata: {},
    };

    try {
      // 1. Check file type
      if (!this.ACCEPTED_IMAGE_FORMATS.includes(file.type)) {
        result.errors.push(
          `Unsupported image format (${file.type}). Accepted: JPEG, PNG, WebP.`
        );
        return result;
      }

      // 2. Check file size
      if (file.size > this.MAX_IMAGE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        result.errors.push(
          `Image size (${sizeMB} MB) exceeds maximum allowed (10 MB). Please compress your image.`
        );
        return result;
      }

      // 3. Get image metadata
      try {
        const metadata = await this.getImageMetadata(file);
        result.metadata = {
          width: metadata.width,
          height: metadata.height,
          fileSize: file.size,
        };
      } catch (error: any) {
        // If we can't read metadata, still accept the image
        result.warnings.push("Unable to read image dimensions.");
      }

      // All validations passed!
      result.valid = true;
      return result;
    } catch (error: any) {
      result.errors.push(
        error.message || "An unexpected error occurred during validation."
      );
      return result;
    }
  }

  /**
   * Validate media file based on type
   */
  static async validateMedia(
    file: File,
    type: "reel" | "video" | "image"
  ): Promise<ValidationResult> {
    if (type === "reel" || type === "video") {
      return this.validateReel(file);
    } else if (type === "image") {
      return this.validateImage(file);
    } else {
      return {
        valid: false,
        errors: [`Unknown media type: ${type}`],
        warnings: [],
      };
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Get accepted aspect ratios for display
   */
  static getAcceptedAspectRatios(): string[] {
    return Object.values(this.ACCEPTED_ASPECT_RATIOS).map((r) => r.name);
  }

  /**
   * Get validation rules summary for display
   */
  static getValidationRules() {
    return {
      aspectRatios: this.getAcceptedAspectRatios(),
      maxDuration: `${this.MAX_DURATION} seconds (2 minutes)`,
      recommendedDuration: `${this.RECOMMENDED_MIN_DURATION}-${this.RECOMMENDED_MAX_DURATION} seconds`,
      maxFileSize: this.formatFileSize(this.MAX_VIDEO_SIZE),
      maxImageSize: this.formatFileSize(this.MAX_IMAGE_SIZE),
      acceptedFormats: "MP4 (H.264 + AAC)",
      acceptedImageFormats: "JPEG, PNG, WebP",
      maxResolution: "1080p (1080×1920)",
      frameRate: "24-30 fps (30 fps recommended)",
    };
  }
}
