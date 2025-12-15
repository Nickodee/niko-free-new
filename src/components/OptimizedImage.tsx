import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
  placeholder?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  onError,
  placeholder = 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const imageSrc = imageError ? placeholder : src;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
}

