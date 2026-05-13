/**
 * SnapAdda Price Utilities — Indian Market Standard (Gajam Edition)
 * Smart formatting: ₹ 1.5 Cr/-, ₹ 50 L/-, ₹ 45,000/-
 */

export const GAJAM_CONSTANTS = {
  ACRE_TO_CENTS: 100,
  ACRE_TO_GAJAM: 4840,
  CENT_TO_GAJAM: 48.4,
  GAJAM_TO_SQFT: 9,
  GUNTA_TO_GAJAM: 121,
  ANKANAM_TO_GAJAM: 8,
  SQ_YARD_TO_GAJAM: 1,
  ACRE_LABEL: 'Acre',
  CENT_LABEL: 'Cent',
  GAJAM_LABEL: 'Sq. Yard (Gajam)',
  GUNTA_LABEL: 'Gunta',
  ANKANAM_LABEL: 'Ankanam'
};

/**
 * Robustly calculate price per cent from price per acre.
 * AP Standard: 1 Acre = 100 Cents. 
 * Therefore Price / Cent = Price / Acre / 100.
 */
export const calcPricePerCent = (pricePerAcre: any): number => {
  const p = Number(pricePerAcre) || 0;
  if (p === 0) return 0;
  return Math.round(p / 100);
};

/**
 * Primary client-facing price formatter — Indian Numbering System
 * Standard: ₹ 1,50,00,000/- or ₹ 1.5 Cr/-
 */
export const formatSnapAddaPrice = (price: any, compact = true): string => {
  if (price === null || price === undefined || price === '' || isNaN(Number(price))) return '₹ 0/-';
  const n = Number(price);
  if (n === 0) return '₹ 0/-';
  
  if (compact) {
    if (n >= 10000000) {
      const cr = n / 10000000;
      return `₹ ${parseFloat(cr.toFixed(2)).toLocaleString('en-IN')} Cr/-`;
    }
    if (n >= 100000) {
      const l = n / 100000;
      return `₹ ${parseFloat(l.toFixed(2)).toLocaleString('en-IN')} L/-`;
    }
  }
  
  return `₹ ${n.toLocaleString('en-IN')}/-`;
};

/**
 * Pure Indian formatting with commas for Admin HUD
 */
export const formatIndianRupees = (n: number | string): string => {
  const num = Number(n) || 0;
  return `₹ ${num.toLocaleString('en-IN')}`;
};

/**
 * Robustly split decimal acres into normalized [Acres, Cents].
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

export const formatLandSize = (totalAcres: any, forceAcresOnly = true): string => {
  if (!totalAcres || isNaN(Number(totalAcres))) return '—';
  const n = Number(totalAcres);
  
  if (forceAcresOnly) {
    return `${parseFloat(n.toFixed(2))} ${n === 1 ? 'Acre' : 'Acres'}`;
  }

  const { acres, cents } = decomposeAcres(totalAcres);
  if (acres === 0) return `${cents} Cents`;
  if (cents === 0) return `${acres} ${acres === 1 ? 'Acre' : 'Acres'}`;
  return `${acres} Ac ${cents} Cents`;
};

/**
 * Calculate Price per unit (e.g. Price per Sq.Yard or Price per Cent)
 */
export const calcPricePerUnit = (totalPrice: number, size: number, unit: string) => {
  const p = Number(totalPrice) || 0;
  const s = Number(size) || 0;
  if (!p || !s) return 0;
  
  const lowUnit = unit?.toLowerCase() || '';
  if (lowUnit.includes('yard') || lowUnit.includes('gajam')) return Math.round(p / s);
  if (lowUnit.includes('cent')) return Math.round(p / s);
  if (lowUnit.includes('acre')) return Math.round(p / s);
  
  return Math.round(p / s);
};

/**
 * Multi-unit converter utility
 */
export const smartAreaConverter = (value: any, fromUnit: string) => {
  const v = Number(value) || 0;
  let acres = 0;

  const u = fromUnit?.toLowerCase();
  if (u === 'acre') acres = v;
  else if (u === 'cent') acres = v / 100;
  else if (u === 'gajam') acres = v / 4840;
  else if (u === 'sq.yards' || u === 'sq.yds' || u === 'gajam') acres = v / 4840;
  else if (u === 'sqft') acres = (v / 9) / 4840;
  else if (u === 'gunta') acres = (v * 121) / 4840;
  else if (u === 'ankanam') acres = (v * 8) / 4840;

  const result = {
    acres: parseFloat(acres.toFixed(4)),
    cents: parseFloat((acres * 100).toFixed(2)),
    gajam: Math.round(acres * 4840),
    sqft: Math.round(acres * 4840 * 9),
    ankanam: Math.round((acres * 4840) / 8),
    display: formatLandSize(acres)
  };
  return result;
};

export const acresCentsToDecimal = (acres: any, cents: any): number => {
  return parseFloat((Number(acres || 0) + Number(cents || 0) / 100).toFixed(4));
};

export const getAcres = (totalAcres: any): number => decomposeAcres(totalAcres).acres;
export const getCents = (totalAcres: any): number => decomposeAcres(totalAcres).cents;

export const calcAgriTotalValue = (pricePerAcre: any, totalAcres: any): number => {
  if (!pricePerAcre || !totalAcres) return 0;
  return Math.round(Number(pricePerAcre) * Number(totalAcres));
};

/**
 * Standardized utility to derive unit-based pricing for all property types.
 * Solves "per acra and per cent are mismatching" by ensuring they always use a single source of truth.
 */
export const getEffectivePricePerUnit = (property: any) => {
  if (!property) return null;
  const type = (property?.type || '').toLowerCase();
  const isAgri = type.includes('agri') || type.includes('farm');
  const isPlot = type.includes('plot') || type.includes('layout') || type.includes('crda');
  
  if (isAgri) {
    // Priority: Database pricePerAcre -> Calculated from total price
    const ppa = property?.pricePerAcre || (property?.price && property?.totalAcres ? (property.price / property.totalAcres) : 0);
    return {
      acre: Math.round(ppa),
      cent: Math.round(ppa / 100)
    };
  }
  
  if (isPlot && property.areaSize > 0) {
    return {
      sqYard: Math.round(Number(property.price) / Number(property.areaSize))
    };
  }
  
  return null;
};
