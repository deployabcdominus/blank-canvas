const CACHE_KEY = "signflow_geocache_v1";

function loadCache(): Record<string, { lat: number; lng: number } | null> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, { lat: number; lng: number } | null>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!address?.trim()) return null;

  const cache = loadCache();
  const cacheKey = address.toLowerCase().trim();

  if (cacheKey in cache) return cache[cacheKey];

  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "SignFlowApp/1.0 (signflowapp.com)",
        },
      }
    );

    const data = await res.json();

    if (data?.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      cache[cacheKey] = coords;
      saveCache(cache);
      return coords;
    }

    cache[cacheKey] = null;
    saveCache(cache);
    return null;
  } catch {
    return null;
  }
}

/** Batch geocode with 1.1s delay between uncached requests */
export async function batchGeocode<T extends { id: string }>(
  items: T[],
  getAddress: (item: T) => string | undefined,
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, { lat: number; lng: number }>> {
  const results = new Map<string, { lat: number; lng: number }>();
  const toGeocode: { item: T; address: string }[] = [];

  // First pass: resolve from cache
  for (const item of items) {
    const address = getAddress(item);
    if (!address?.trim()) continue;

    const cache = loadCache();
    const cacheKey = address.toLowerCase().trim();
    if (cacheKey in cache) {
      const cached = cache[cacheKey];
      if (cached) results.set(item.id, cached);
    } else {
      toGeocode.push({ item, address });
    }
  }

  // Second pass: fetch uncached with rate limiting
  for (let i = 0; i < toGeocode.length; i++) {
    const { item, address } = toGeocode[i];
    const coords = await geocodeAddress(address);
    if (coords) results.set(item.id, coords);
    onProgress?.(i + 1, toGeocode.length);

    if (i < toGeocode.length - 1) {
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  return results;
}

export function useGeocoding() {
  return { geocodeAddress, batchGeocode };
}
