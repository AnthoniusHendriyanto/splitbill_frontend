/**
 * Formats a number as Indonesian Rupiah (IDR).
 * Rounds to int before formatting — standard for IDR display.
 * @param {number} val
 * @returns {string} e.g. "1.450.000"
 */
export const formatIDR = (val) => Math.round(val).toLocaleString('id-ID');
