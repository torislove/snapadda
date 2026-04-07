/**
 * SnapAdda Price Utilities — Indian Market Standard (Gajam Edition)
 * Smart formatting: ₹ 1.5 Cr/-, ₹ 50 L/-, ₹ 45,000/-
 */

export const GAJAM_CONSTANTS = {
  ACRE_TO_CENTS: 100,
  ACRE_TO_GAJAM: 4840,
  CENT_TO_GAJAM: 48.4,
  GAJAM_TO_SQFT: 9,
  GUNTA_TO_GAJAM: 121
};

/**
 * Primary client-facing price formatter
 * Shows human-readable Cr / L shorthand
 * Rules:
 *   500,000 -> 5 L/-
 *   5,000,000 -> 50 L/-
 *   50,000,000 -> 5 Cr/-
 */
export const formatSnapAddaPrice = (price: any): string => {
  if (price === null || price === undefined || price === '' || isNaN(Number(price))) return '₹ 0/-';
  const n = Number(price);
  if (n === 0) return '₹ 0/-';
  
  if (n >= 10000000) {
    const cr = n / 10000000;
    return `₹ ${parseFloat(cr.toFixed(2))} Cr/-`;
  }
  if (n >= 100000) {
    const l = n / 100000;
    return `₹ ${parseFloat(l.toFixed(2))} L/-`;
  }
  return `₹ ${n.toLocaleString('en-IN')}/-`;
};

/**
 * Format land size in AP standard: Acres + Cents
 * 1 Acre = 100 Cents
 */
/**
 * Robustly split decimal acres into normalized [Acres, Cents].
 * Handles floating point rounding (e.g. 1.9999 -> 2 Acres, 0 Cents).
 */
export const decomposeAcres = (totalAcres: any) => {
  const n = parseFloat(Number(totalAcres).toFixed(4)) || 0;
  let acres = Math.floor(n);
  let cents = Math.round((n - acres) * 100);
  
  if (cents >= 100) {
    const rollover = Math.floor(cents / 100);
    acres += rollover;
    cents = cents % 100;
  }
  
  return { acres, cents };
};

export const formatLandSize = (totalAcres: any): string => {
  if (!totalAcres || isNaN(Number(totalAcres))) return '—';
  const { acres, cents } = decomposeAcres(totalAcres);
  
  if (acres === 0) return `${cents} Cents`;
  if (cents === 0) return `${acres} ${acres === 1 ? 'Acre' : 'Acres'}`;
  return `${acres} ${acres === 1 ? 'Acre' : 'Acres'} ${cents} Cents`;
};

/**
 * Multi-unit converter utility
 * @param {number} value - input value
 * @param {string} fromUnit - 'acre', 'cent', 'gajam', 'sqft'
 */
export const smartAreaConverter = (value: any, fromUnit: string) => {
  const v = Number(value) || 0;
  let acres = 0;

  if (fromUnit === 'acre') acres = v;
  else if (fromUnit === 'cent') acres = v / 100;
  else if (fromUnit === 'gajam') acres = v / 4840;
  else if (fromUnit === 'sqft') acres = (v / 9) / 4840;
  else if (fromUnit === 'gunta') acres = (v * 121) / 4840;

  const result = {
    acres: parseFloat(acres.toFixed(4)),
    cents: parseFloat((acres * 100).toFixed(2)),
    gajam: Math.round(acres * 4840),
    sqft: Math.round(acres * 4840 * 9),
    display: formatLandSize(acres)
  };
  return result;
};

export const acresCentsToDecimal = (acres: any, cents: any): number => {
  // Use toFixed(4) to avoid floating point noise from addition
  return parseFloat((Number(acres || 0) + Number(cents || 0) / 100).toFixed(4));
};

export const getAcres = (totalAcres: any): number => decomposeAcres(totalAcres).acres;
export const getCents = (totalAcres: any): number => decomposeAcres(totalAcres).cents;

export const calcAgriTotalValue = (pricePerAcre: any, totalAcres: any): number => {
  if (!pricePerAcre || !totalAcres) return 0;
  return Math.round(Number(pricePerAcre) * Number(totalAcres));
};
