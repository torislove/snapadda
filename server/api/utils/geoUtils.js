import fetch from 'node-fetch';

/**
 * Extracts latitude and longitude from various Google Maps link formats.
 * Supports:
 * - @lat,lng
 * - q=lat,lng
 * - /dir/lat,lng
 * - ll=lat,lng
 * - !3d lat !4d lng
 * - Brute force regex
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

    // Pattern 3: /place/name/lat,lng
    const placeMatch = url.match(/\/place\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (placeMatch) return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) };

    // Pattern 4: /dir/lat,lng
    const dirMatch = url.match(/\/dir\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (dirMatch) return { lat: parseFloat(dirMatch[1]), lng: parseFloat(dirMatch[2]) };

    // Pattern 5: ll=lat,lng
    const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };

    // Pattern 6: !3d lat !4d lng
    const d3dMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (d3dMatch) return { lat: parseFloat(d3dMatch[1]), lng: parseFloat(d3dMatch[2]) };

    // Pattern 7: Brute force fallback
    const bruteMatch = url.match(/(-?\d+\.\d{5,}),\s*(-?\d+\.\d{5,})/);
    if (bruteMatch) return { lat: parseFloat(bruteMatch[1]), lng: parseFloat(bruteMatch[2]) };

  } catch (e) {
    console.warn('Failed to parse googleMapsLink for coords:', e);
  }

  return null;
}

/**
 * Resolves shortened Google Maps links (goo.gl) to their full versions
 * and then extracts coordinates.
 */
export async function resolveAndExtractCoords(url) {
  if (!url) return null;

  // If it's a short link, resolve it first
  if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      const finalUrl = response.url;
      return extractCoordsFromLink(finalUrl);
    } catch (err) {
      console.error('Error resolving short link:', err.message);
      return null;
    }
  }

  return extractCoordsFromLink(url);
}
