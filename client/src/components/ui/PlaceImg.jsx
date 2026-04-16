import React from 'react';
import { generateOptimizedImage } from '@/utils/imageOptimization';

const PlaceImg = ({ place, index = 0, className = null }) => {
  if (!place.photos?.length) {
    return '';
  }
  if (!className) {
    className = 'object-cover';
  }
  // Use aggressive compression (quality 65) for much smaller files
  const optimizedUrl = generateOptimizedImage(place.photos[index], 800, 65);
  return (
    <img
      src={optimizedUrl}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};

export default PlaceImg;
