/**
 * SnapAdda Price Utilities — Indian Market Standard
 * Smart formatting: ₹ 1.5 Cr/-, ₹ 50 L/-, ₹ 45,000/-
 */

/**
 * Primary client-facing price formatter
 * Shows human-readable Cr / L shorthand
 */
export const formatSnapAddaPrice = (price) => {
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
 * Admin list view format — also smart Cr/L
 */
export const formatPriceAdmin = (price) => {
  if (!price || isNaN(Number(price))) return '₹ 0/-';
  const n = Number(price);
  if (n >= 10000000) return `₹ ${parseFloat((n / 10000000).toFixed(2))} Cr/-`;
  if (n >= 100000) return `₹ ${parseFloat((n / 100000).toFixed(2))} L/-`;
  return `₹ ${n.toLocaleString('en-IN')}/-`;
};

/**
 * Format land size in AP standard: Acres + Cents
 * 1 Acre = 100 Cents
 * @param {number} totalAcres - decimal acres (e.g. 2.5 = 2 acres 50 cents)
 * @returns {string} e.g. "2 Acres 50 Cents"
 */
export const formatLandSize = (totalAcres) => {
  if (!totalAcres || isNaN(Number(totalAcres))) return '—';
  const n = Number(totalAcres);
  const acres = Math.floor(n);
  const cents = Math.round((n - acres) * 100);
  if (acres === 0) return `${cents} Cents`;
  if (cents === 0) return `${acres} ${acres === 1 ? 'Acre' : 'Acres'}`;
  return `${acres} ${acres === 1 ? 'Acre' : 'Acres'} ${cents} Cents`;
};

/**
 * Convert Acres+Cents to decimal Acres
 * @param {number} acres
 * @param {number} cents
 * @returns {number} decimal acres
 */
export const acresCentsToDecimal = (acres, cents) => {
  return Number(acres || 0) + Number(cents || 0) / 100;
};

/**
 * Get acres from decimal
 */
export const getAcres = (totalAcres) => Math.floor(Number(totalAcres) || 0);

/**
 * Get cents from decimal acres
 */
export const getCents = (totalAcres) => Math.round(((Number(totalAcres) || 0) % 1) * 100);

/**
 * Calculate total agricultural land value
 * @param {number} pricePerAcre - price per acre in rupees
 * @param {number} totalAcres - total area in acres (decimal)
 * @returns {number} total value
 */
export const calcAgriTotalValue = (pricePerAcre, totalAcres) => {
  if (!pricePerAcre || !totalAcres) return 0;
  return Math.round(Number(pricePerAcre) * Number(totalAcres));
};
