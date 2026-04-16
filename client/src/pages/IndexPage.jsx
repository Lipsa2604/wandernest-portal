import { usePlaces } from '../../hooks';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Spinner from '@/components/ui/Spinner';
import PlaceCard from '@/components/ui/PlaceCard';

const IndexPage = () => {
  const allPlaces = usePlaces();
  const { places, loading } = allPlaces;
  const [visibleCount, setVisibleCount] = useState(12);
  const scrollTimeoutRef = useRef(null);
  const hasMoreRef = useRef(true);

  // Memoize displayed places to prevent unnecessary recalculations
  const displayedPlaces = useMemo(() => {
    return places.slice(0, visibleCount);
  }, [places, visibleCount]);

  // Check if there are more items to load
  useEffect(() => {
    hasMoreRef.current = visibleCount < places.length;
  }, [visibleCount, places.length]);

  // Optimized scroll handler with proper throttling
  const handleScroll = useCallback(() => {
    // Skip if already a timeout pending or no more items
    if (scrollTimeoutRef.current || !hasMoreRef.current) return;

    // Check if at bottom (800px trigger)
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 800
    ) {
      // Load next batch
      setVisibleCount((prev) => Math.min(prev + 6, places.length));

      // Set timeout to throttle future requests (500ms)
      scrollTimeoutRef.current = setTimeout(() => {
        scrollTimeoutRef.current = null;
      }, 500);
    }
  }, [places.length]);

  // Attach scroll listener
  useEffect(() => {
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="grid grid-cols-1 justify-items-center px-4 py-32 md:grid-cols-2 md:gap-0 lg:grid-cols-3 lg:gap-2 xl:grid-cols-4 xl:gap-10">
        {places.length > 0 ? (
          displayedPlaces.map((place) => (
            <PlaceCard place={place} key={place._id} />
          ))
        ) : (
          <div className="absolute left-1/2 right-1/2 top-40 flex  w-full -translate-x-1/2 transform flex-col p-10  md:w-1/2">
            <h1 className="text-3xl font-semibold">Result not found!</h1>
            <p className="text-lg font-semibold">
              Sorry, we couldn&#39;t find the place you&#39;re looking for.
            </p>
            <button className="mt-4 w-32 rounded-full bg-primary p-2 text-white">
              <a href="/" className="flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Go back
              </a>
            </button>
          </div>
        )}
      </div>

      {/* Loading indicator for infinite scroll - only show when there are more items and we haven't loaded all */}
      {displayedPlaces.length > 0 && visibleCount < places.length && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
        </div>
      )}
    </>
  );
};

export default IndexPage;
