/**
 * Andhra Pradesh — District & Major City Coordinates
 * Used for offline nearby property search (no external API required)
 * Radius configurable via Admin panel (SiteSetting: nearby_radius_km)
 */
export const AP_LOCATIONS = [
  // ── Krishna District ──
  { name: 'Vijayawada', district: 'Krishna', lat: 16.5062, lng: 80.6480 },
  { name: 'Machilipatnam', district: 'Krishna', lat: 16.1875, lng: 81.1389 },
  { name: 'Gudivada', district: 'Krishna', lat: 16.4357, lng: 80.9933 },
  { name: 'Nuzvid', district: 'Krishna', lat: 16.7893, lng: 80.8481 },
  { name: 'Nandigama', district: 'Krishna', lat: 16.7756, lng: 80.2870 },
  { name: 'Tiruvuru', district: 'Krishna', lat: 16.9700, lng: 80.5900 },
  { name: 'Jaggayyapeta', district: 'Krishna', lat: 17.0338, lng: 80.1004 },

  // ── Guntur District ──
  { name: 'Guntur', district: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { name: 'Tenali', district: 'Guntur', lat: 16.2427, lng: 80.6396 },
  { name: 'Narasaraopet', district: 'Guntur', lat: 16.2335, lng: 80.0474 },
  { name: 'Mangalagiri', district: 'Guntur', lat: 16.4303, lng: 80.5572 },
  { name: 'Ponnur', district: 'Guntur', lat: 16.0674, lng: 80.5565 },
  { name: 'Bapatla', district: 'Guntur', lat: 15.9053, lng: 80.4671 },
  { name: 'Sattenapalle', district: 'Guntur', lat: 16.3949, lng: 79.9747 },
  { name: 'Chirala', district: 'Guntur', lat: 15.8185, lng: 80.3536 },

  // ── NTR District (carved from Krishna) ──
  { name: 'Amaravati', district: 'NTR', lat: 16.5731, lng: 80.3565 },
  { name: 'Tadepalle', district: 'NTR', lat: 16.4811, lng: 80.6011 },
  { name: 'Ibrahimpatnam', district: 'NTR', lat: 16.5500, lng: 80.4200 },
  { name: 'Kondapalli', district: 'NTR', lat: 16.6185, lng: 80.5420 },

  // ── Visakhapatnam District ──
  { name: 'Visakhapatnam', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Gajuwaka', district: 'Visakhapatnam', lat: 17.6770, lng: 83.2098 },
  { name: 'Bheemunipatnam', district: 'Visakhapatnam', lat: 17.8936, lng: 83.4527 },
  { name: 'Anakapalle', district: 'Visakhapatnam', lat: 17.6913, lng: 82.9992 },
  { name: 'Narsipatnam', district: 'Visakhapatnam', lat: 17.6692, lng: 82.6134 },

  // ── East Godavari District ──
  { name: 'Kakinada', district: 'East Godavari', lat: 16.9891, lng: 82.2475 },
  { name: 'Rajahmundry', district: 'East Godavari', lat: 17.0005, lng: 81.8040 },
  { name: 'Amalapuram', district: 'East Godavari', lat: 16.5786, lng: 82.0064 },
  { name: 'Mandapeta', district: 'East Godavari', lat: 16.8657, lng: 81.9263 },
  { name: 'Samarlakota', district: 'East Godavari', lat: 17.0510, lng: 82.1777 },

  // ── West Godavari District ──
  { name: 'Eluru', district: 'West Godavari', lat: 16.7107, lng: 81.0952 },
  { name: 'Bhimavaram', district: 'West Godavari', lat: 16.5449, lng: 81.5212 },
  { name: 'Tanuku', district: 'West Godavari', lat: 16.8619, lng: 81.6824 },
  { name: 'Nidadavolu', district: 'West Godavari', lat: 17.0564, lng: 81.6737 },
  { name: 'Palacole', district: 'West Godavari', lat: 16.5150, lng: 81.7350 },

  // ── SPSR Nellore District ──
  { name: 'Nellore', district: 'SPSR Nellore', lat: 14.4426, lng: 79.9865 },
  { name: 'Kavali', district: 'SPSR Nellore', lat: 14.9166, lng: 79.9944 },
  { name: 'Gudur', district: 'SPSR Nellore', lat: 14.1517, lng: 79.8520 },
  { name: 'Sullurpeta', district: 'SPSR Nellore', lat: 13.9731, lng: 80.1011 },

  // ── Prakasam District ──
  { name: 'Ongole', district: 'Prakasam', lat: 15.5057, lng: 80.0499 },
  { name: 'Kandukur', district: 'Prakasam', lat: 15.2147, lng: 79.9002 },
  { name: 'Markapur', district: 'Prakasam', lat: 15.7413, lng: 79.2589 },
  { name: 'Giddalur', district: 'Prakasam', lat: 15.3771, lng: 78.9254 },

  // ── SPS Nellore ──
  { name: 'Atmakur', district: 'SPSR Nellore', lat: 14.6238, lng: 79.6215 },

  // ── Kurnool District ──
  { name: 'Kurnool', district: 'Kurnool', lat: 15.8281, lng: 78.0373 },
  { name: 'Nandyal', district: 'Kurnool', lat: 15.4786, lng: 78.4838 },
  { name: 'Adoni', district: 'Kurnool', lat: 15.6243, lng: 77.2728 },
  { name: 'Dhone', district: 'Kurnool', lat: 15.3990, lng: 77.8714 },
  { name: 'Yemmiganur', district: 'Kurnool', lat: 15.7728, lng: 77.4851 },

  // ── Anantapur District ──
  { name: 'Anantapur', district: 'Anantapur', lat: 14.6819, lng: 77.6006 },
  { name: 'Hindupur', district: 'Anantapur', lat: 13.8295, lng: 77.4907 },
  { name: 'Guntakal', district: 'Anantapur', lat: 15.1695, lng: 77.3697 },
  { name: 'Kadiri', district: 'Anantapur', lat: 14.1148, lng: 78.1552 },
  { name: 'Tadipatri', district: 'Anantapur', lat: 14.9038, lng: 77.9907 },

  // ── YSR Kadapa District ──
  { name: 'Kadapa', district: 'YSR Kadapa', lat: 14.4674, lng: 78.8241 },
  { name: 'Proddatur', district: 'YSR Kadapa', lat: 14.7503, lng: 78.5480 },
  { name: 'Badvel', district: 'YSR Kadapa', lat: 14.7461, lng: 79.0597 },
  { name: 'Rajampet', district: 'YSR Kadapa', lat: 14.1934, lng: 79.1621 },

  // ── Chittoor District ──
  { name: 'Tirupati', district: 'Chittoor', lat: 13.6288, lng: 79.4192 },
  { name: 'Chittoor', district: 'Chittoor', lat: 13.2172, lng: 79.1003 },
  { name: 'Madanapalle', district: 'Chittoor', lat: 13.5562, lng: 78.5031 },
  { name: 'Srikalahasti', district: 'Chittoor', lat: 13.7495, lng: 79.6988 },
  { name: 'Puttur', district: 'Chittoor', lat: 13.4410, lng: 79.5527 },

  // ── Srikakulam District ──
  { name: 'Srikakulam', district: 'Srikakulam', lat: 18.2949, lng: 83.8994 },
  { name: 'Narasannapeta', district: 'Srikakulam', lat: 18.4143, lng: 84.0388 },
  { name: 'Palasa', district: 'Srikakulam', lat: 18.7732, lng: 84.4163 },
  { name: 'Amadalavalasa', district: 'Srikakulam', lat: 18.4116, lng: 83.8975 },

  // ── Vizianagaram District ──
  { name: 'Vizianagaram', district: 'Vizianagaram', lat: 18.1067, lng: 83.3956 },
  { name: 'Bobbili', district: 'Vizianagaram', lat: 18.5737, lng: 83.3576 },
  { name: 'Parvathipuram', district: 'Vizianagaram', lat: 18.7832, lng: 83.4277 },

  // ── Alluri Sitarama Raju District ──
  { name: 'Paderu', district: 'Alluri Sitarama Raju', lat: 18.0727, lng: 82.6600 },
  { name: 'Rampachodavaram', district: 'Alluri Sitarama Raju', lat: 17.4397, lng: 81.7878 },

  // ── Konaseema District ──
  { name: 'Amalapuram', district: 'Konaseema', lat: 16.5786, lng: 82.0064 },
  { name: 'Razole', district: 'Konaseema', lat: 16.4768, lng: 81.8465 },

  // ── Bapatla District ──
  { name: 'Bapatla', district: 'Bapatla', lat: 15.9053, lng: 80.4671 },
  { name: 'Repalle', district: 'Bapatla', lat: 16.0218, lng: 80.8335 },

  // ── Palnadu District ──
  { name: 'Narasaraopet', district: 'Palnadu', lat: 16.2335, lng: 80.0474 },
  { name: 'Macherla', district: 'Palnadu', lat: 16.4759, lng: 79.4330 },
  { name: 'Gurazala', district: 'Palnadu', lat: 16.5811, lng: 79.6199 },

  // ── Nandyal District ──
  { name: 'Nandyal', district: 'Nandyal', lat: 15.4786, lng: 78.4838 },
  { name: 'Srisailam', district: 'Nandyal', lat: 16.0761, lng: 78.8804 },

  // ── Sri Sathya Sai District ──
  { name: 'Puttaparthi', district: 'Sri Sathya Sai', lat: 14.1660, lng: 77.8252 },

  // ── Eluru District ──
  { name: 'Eluru', district: 'Eluru', lat: 16.7107, lng: 81.0952 },
];

/**
 * Calculate great-circle distance in km between two lat/lng points
 * Haversine formula — no external API needed
 */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find all AP city names within `radiusKm` of given coordinates
 */
export function getCitiesNearby(lat, lng, radiusKm = 25) {
  return AP_LOCATIONS
    .map(c => ({ ...c, distance: distanceKm(lat, lng, c.lat, c.lng) }))
    .filter(c => c.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
