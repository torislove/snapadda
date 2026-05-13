/**
 * Extracts latitude and longitude from various Google Maps link formats.
 * Supports:
 * - @lat,lng
 * - q=lat,lng
 * - /dir/lat,lng
 * - ll=lat,lng
 */
export function extractCoordsFromLink(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    // Pattern 1: @lat,lng
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    
    // Pattern 2: q=lat,lng
    const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

    // Pattern 3: /dir/lat,lng
    const dirMatch = url.match(/\/dir\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (dirMatch) return { lat: parseFloat(dirMatch[1]), lng: parseFloat(dirMatch[2]) };

    // Pattern 4: ll=lat,lng
    const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
  } catch (e) {
    console.warn('Failed to parse googleMapsLink for coords:', e);
  }

  return null;
}
