import locations from '../data/AndhraLocations.json';

/**
 * Smart Search Parser for SnapAdda Admin (Refined V3)
 */

interface SmartSearchResult {
  keyword: string;
  type: string | null;
  city: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  bhk: string | null;
  detectedLocation: any | null;
}

const CATEGORIES = [
  'Agriculture', 'Flat', 'Apartment', 'Villa', 'Plot', 'House', 'Commercial', 'Farmhouse'
];

const PRICE_UNITS: Record<string, number> = {
  'lakh': 100000,
  'lakhs': 100000,
  'l': 100000,
  'crore': 10000000,
  'crores': 10000000,
  'cr': 10000000,
};

const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
};

export const parseSmartSearch = (query: string): SmartSearchResult | null => {
  if (!query) return null;
  const q = query.toLowerCase();
  const result: SmartSearchResult = {
    keyword: query,
    type: null,
    city: null,
    minPrice: null,
    maxPrice: null,
    bhk: null,
    detectedLocation: null,
  };

  // 1. Detect Category
  CATEGORIES.forEach(cat => {
    if (q.includes(cat.toLowerCase())) {
      result.type = cat;
    }
  });

  // 2. Detect BHK
  const bhkMatch = q.match(/(\d)\s*bhk/i);
  if (bhkMatch) result.bhk = bhkMatch[1];

  // 3. Detect Price Range
  const rangeRegex = /(\d+(\.\d+)?)\s*(l|cr|lakhs?|crores?)\s*(to|and|-|between)?\s*(\d+(\.\d+)?)\s*(l|cr|lakhs?|crores?)/gi;
  const rangeMatch = rangeRegex.exec(q);
  if (rangeMatch) {
    const val1 = parseFloat(rangeMatch[1]);
    const unit1 = rangeMatch[3].toLowerCase();
    const val2 = parseFloat(rangeMatch[5]);
    const unit2 = rangeMatch[7].toLowerCase();
    result.minPrice = val1 * (PRICE_UNITS[unit1] || 1);
    result.maxPrice = val2 * (PRICE_UNITS[unit2] || 1);
  }

  // 4. Detect Single Price
  if (!result.maxPrice) {
    const priceRegex = /(\d+(\.\d+)?)\s*(lakhs?|l|crores?|cr)/gi;
    let match;
    while ((match = priceRegex.exec(q)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[3].toLowerCase();
      result.maxPrice = value * (PRICE_UNITS[unit] || 1);
    }
  }
  
  if (!result.maxPrice) {
    const plainNumRegex = /\b(\d{5,})\b/g;
    const numMatch = plainNumRegex.exec(q);
    if (numMatch) result.maxPrice = parseInt(numMatch[1]);
  }

  // 5. Detect Location (Fuzzy)
  let bestMatch: any = null;
  let lowestDist = 100;

  locations.forEach((loc: any) => {
    const locName = loc.name.toLowerCase();
    if (q.includes(locName)) {
      bestMatch = loc;
      lowestDist = 0;
      return;
    }
    const words = q.split(/\s+/);
    words.forEach(word => {
      if (word.length < 3) return;
      const dist = getLevenshteinDistance(word, locName);
      if (dist <= 1 && dist < lowestDist) {
        lowestDist = dist;
        bestMatch = loc;
      }
    });
  });

  if (bestMatch) {
    result.city = bestMatch.name;
    result.detectedLocation = bestMatch;
  }

  return result;
};

export const getFuzzySuggestions = (input: string): any[] => {
  if (!input || input.length < 2) return [];
  const q = input.toLowerCase();
  
  return locations
    .map((loc: any) => {
      const name = loc.name.toLowerCase();
      let score = 100;
      if (name.startsWith(q)) score = 0;
      else if (name.includes(q)) score = 5;
      else {
        const dist = getLevenshteinDistance(q, name.substring(0, q.length + 1));
        if (dist <= 1) score = 10;
      }
      return { ...loc, score };
    })
    .filter((loc: any) => loc.score <= 10)
    .sort((a: any, b: any) => a.score - b.score)
    .slice(0, 8);
};
