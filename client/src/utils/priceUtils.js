/**
 * Standardized Indian Price Formatting for SnapAdda
 * Example: 500000 -> ₹ 5,00,000/-
 * Example: 15000000 -> ₹ 1,50,00,000/-
 */
export const formatSnapAddaPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return '₹ 0/-';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  // Remove the currency symbol from Intl to manually control spacing and suffix
  const formatted = formatter.format(price).replace('₹', '').trim();
  return `₹ ${formatted}/-`;
};

/**
 * Unit-based formatting for Admin list views (Cr / L)
 */
export const formatPriceAdmin = (price) => {
  if (!price) return '₹ 0/-';
  if (price >= 10000000) return `₹ ${(price / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr/-`;
  if (price >= 100000) return `₹ ${(price / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L/-`;
  return `₹ ${price.toLocaleString('en-IN')}/-`;
};
