/**
 * Standardized Indian Price Formatting for SnapAdda
 * Translates big numbers into Lakh / Crore.
 */
export const formatSnapAddaPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return '₹ 0/-';
  
  const num = Number(price);
  
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return `${formatter.format(num).trim()}/-`;
};

/**
 * Unit-based formatting for Admin list views (Cr / L)
 */
export const formatPriceAdmin = (price) => {
  return formatSnapAddaPrice(price);
};
