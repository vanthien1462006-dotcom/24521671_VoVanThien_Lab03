const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

/**
 * Formats an amount in Vietnamese dong, for example 1990000 becomes '1.990.000 ₫'.
 * @param {number} amount
 * @returns {string}
 */
export function formatVnd(amount) {
  return VND.format(amount)
}
