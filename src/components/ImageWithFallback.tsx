import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  containerClassName?: string;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  containerClassName,
  fallback,
  ...props
}: ImageWithFallbackProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted/20", containerClassName)}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full skeleton-shimmer" />
      )}
      
      {error ? (
        <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/10">
          {fallback || <ImageIcon className="w-6 h-6 opacity-20" />}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-all duration-500",
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};
