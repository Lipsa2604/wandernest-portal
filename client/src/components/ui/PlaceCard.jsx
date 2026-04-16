import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { generateBlurredPlaceholder, generateOptimizedImage } from '@/utils/imageOptimization';

const PlaceCard = memo(({ place }) => {
  const { _id: placeId, photos, address, title, price } = place;
  const [isLoaded, setIsLoaded] = useState(false);
  const photoUrl = photos?.[0];
  
  // Card image is max 435px on mobile (sm), so 500px optimized width is good for all devices
  // Use quality 65 for aggressive compression (much smaller files)
  const optimizedPhotoUrl = photoUrl ? generateOptimizedImage(photoUrl, 500, 65) : null;
  const blurredUrl = photoUrl ? generateBlurredPlaceholder(photoUrl) : null;

  return (
    <Link to={`/place/${placeId}`} className="m-4 flex flex-col md:m-2 xl:m-0">
      <div className="card flex flex-col w-full">
        {/* Image container - takes majority of space */}
        <div className="relative overflow-hidden flex-1 rounded-t-xl bg-gray-200">
          {photoUrl && (
            <>
              {/* Blurred placeholder - shown first (minimal data) */}
              {blurredUrl && (
                <img
                  src={blurredUrl}
                  className={`absolute inset-0 h-full w-full object-cover blur-lg transition-opacity duration-500 ${
                    isLoaded ? 'opacity-0' : 'opacity-100'
                  }`}
                  alt=""
                  style={{ willChange: 'opacity' }}
                  aria-hidden="true"
                />
              )}
              {/* Full resolution compressed image - shown when loaded */}
              <img
                src={optimizedPhotoUrl}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
                alt={address}
                onLoad={() => setIsLoaded(true)}
                style={{ willChange: 'opacity' }}
              />
            </>
          )}
        </div>

        {/* Text content container - fixed height at bottom */}
        <div className="bg-white p-3 rounded-b-xl flex flex-col justify-between flex-shrink-0">
          <div>
            <h2 className="truncate font-bold text-sm md:text-base">{address}</h2>
            <h3 className="truncate text-xs md:text-sm text-gray-500">{title}</h3>
          </div>
          <div className="mt-2">
            <span className="font-semibold text-sm">₹{price} </span>
            <span className="text-xs md:text-sm text-gray-600">per night</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

PlaceCard.displayName = 'PlaceCard';

export default PlaceCard;
