// Utility to generate optimized image URLs with aggressive compression
// Using Cloudinary API for extreme compression with lower quality

/**
 * Generate aggressively compressed image URL
 * @param {string} imageUrl - Original image URL
 * @param {number} width - Maximum width for the image
 * @param {number} quality - Quality level (lower = smaller file, default 65 for aggressive compression)
 * @returns {string} Optimized Cloudinary URL
 */
export const generateOptimizedImage = (imageUrl, width = 800, quality = 65) => {
  if (!imageUrl) return null;

  // If already a Cloudinary URL, modify transformations
  if (imageUrl.includes('cloudinary.com')) {
    // Aggressive compression settings:
    // w_800: resize to max width
    // q_65: low quality (65%) for aggressive compression
    // f_auto: automatic format selection (WebP, AVIF for modern browsers)
    // c_limit: fit within dimensions
    // dpr_auto: handle retina displays
    // fl_progressive: progressive JPEG for faster perceived load
    // strip: remove all metadata (removes extra ~10-15KB)
    const optimizedUrl = imageUrl.replace(
      '/image/fetch/',
      `/image/fetch/w_${width},q_${quality},f_auto,c_limit,dpr_auto,fl_progressive,fl_strip/`
    );
    return optimizedUrl;
  }

  // For direct Unsplash images
  if (imageUrl.includes('images.unsplash.com') || imageUrl.includes('res.cloudinary.com')) {
    return `${imageUrl}?w=${width}&q=${quality}&auto=format,compress`;
  }

  return imageUrl;
};

/**
 * Generate ultra-minimal blurred placeholder (LQIP)
 * Extremely tiny and blurred for instant visual feedback
 * @param {string} imageUrl - Original image URL
 * @returns {string} Blurred placeholder URL
 */
export const generateBlurredPlaceholder = (imageUrl) => {
  if (!imageUrl) return null;

  // Ultra-minimal settings:
  // w_10: 10px width (tiny!)
  // q_1: extreme compression (1% quality)
  // bl_300: heavy blur for plausible deniability
  // f_auto: auto format
  // fl_strip: remove metadata
  if (imageUrl.includes('cloudinary.com')) {
    const blurredUrl = imageUrl.replace(
      '/image/fetch/',
      '/image/fetch/w_10,q_1,f_auto,bl_300,fl_strip/'
    );
    return blurredUrl;
  }

  if (imageUrl.includes('images.unsplash.com')) {
    return `${imageUrl}?w=10&q=1&blur=300&auto=format`;
  }

  return imageUrl;
};

/**
 * Generate data URL placeholder with gray background
 * @returns {string} Data URL for instant placeholder
 */
export const getPlaceholderDataUrl = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e5e7eb'; // bg-gray-200
  ctx.fillRect(0, 0, 10, 10);
  return canvas.toDataURL();
};

/**
 * Generate responsive image srcset for different screen sizes (with aggressive compression)
 * @param {string} imageUrl - Original image URL
 * @param {number} quality - Quality level (default 65 for aggressive compression)
 * @returns {string} srcset attribute value for responsive images
 */
export const generateResponsiveImageSrcset = (imageUrl, quality = 65) => {
  if (!imageUrl) return '';

  const sizes = [300, 500, 800, 1200]; // Different breakpoints
  const srcset = sizes
    .map((size) => {
      const optimizedUrl = generateOptimizedImage(imageUrl, size, quality);
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');

  return srcset;
};

/**
 * Get optimal width based on container
 * @param {number} viewportWidth - Window inner width
 * @returns {number} Optimal image width
 */
export const getOptimalImageWidth = (viewportWidth) => {
  if (viewportWidth < 768) return 400; // Mobile
  if (viewportWidth < 1024) return 600; // Tablet
  if (viewportWidth < 1280) return 800; // Desktop
  return 1000; // Large desktop
};
