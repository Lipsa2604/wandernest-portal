import React, { useState, useEffect, useRef } from 'react';
import { generateBlurredPlaceholder, getPlaceholderDataUrl, generateOptimizedImage, getOptimalImageWidth } from '@/utils/imageOptimization';

const Image = ({ src, ...rest }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [blurredSrc, setBlurredSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimalWidth, setOptimalWidth] = useState(800);
  const imgRef = useRef(null);

  // Calculate optimal width based on viewport
  useEffect(() => {
    const updateOptimalWidth = () => {
      setOptimalWidth(getOptimalImageWidth(window.innerWidth));
    };

    updateOptimalWidth();
    window.addEventListener('resize', updateOptimalWidth);
    return () => window.removeEventListener('resize', updateOptimalWidth);
  }, []);

  // Set blurred placeholder immediately
  useEffect(() => {
    if (src) {
      const placeholder = generateBlurredPlaceholder(src);
      setBlurredSrc(placeholder || getPlaceholderDataUrl());
    }
  }, [src]);

  // Lazy load the full resolution image (compressed)
  useEffect(() => {
    if (!src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use aggressively compressed image URL (quality 65 for much smaller files)
            const optimizedUrl = generateOptimizedImage(src, optimalWidth, 65);
            
            // Start loading full resolution compressed image
            const img = new Image();
            img.onload = () => {
              setImageSrc(optimizedUrl);
              setIsLoaded(true);
            };
            img.onerror = () => {
              // Fallback to blurred if full image fails
              setImageSrc(blurredSrc);
              setIsLoaded(true);
            };
            img.src = optimizedUrl;
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, blurredSrc, optimalWidth]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-200">
      {/* Blurred placeholder - shown first */}
      {blurredSrc && (
        <img
          src={blurredSrc}
          alt={''}
          className={`absolute inset-0 w-full h-full rounded-xl blur-lg transition-opacity duration-500 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ willChange: 'opacity' }}
        />
      )}

      {/* Full resolution compressed image - shown when loaded */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={''}
        {...rest}
        className={`relative w-full h-full rounded-xl transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        decoding="async"
        style={{ willChange: 'opacity' }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default Image;
