import { useStorageUrl } from "@/hooks/useStorageUrl";

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  bucket: string;
  path: string | null | undefined;
  fallback?: React.ReactNode;
}

export function StorageImage({ bucket, path, fallback, ...props }: StorageImageProps) {
  const { url, loading } = useStorageUrl(bucket, path);

  if (loading && !url) {
    return (
      <div 
        className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded ${props.className}`} 
        style={{ ...props.style, minHeight: props.height || 40 }} 
      />
    );
  }

  if (!url && fallback) return <>{fallback}</>;

  return <img src={url || ""} {...props} />;
}
