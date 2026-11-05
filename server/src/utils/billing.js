/**
 * EV Charger Sharing Platform Billing Calculation Utility
 * Follows the exact formula defined in requirements:
 * 
 * Energy Charge = Energy Consumed (kWh) × Price per kWh
 * Time Charge = Billable Duration (hours) × Price per Hour (if enabled by host)
 * Subtotal = Energy Charge + Time Charge
 * Final Amount = Subtotal + Applicable Fees + Taxes − Discounts
 */

export const calculateBill = ({
  energyConsumedKWh = 0,
  durationMinutes = 0,
  pricePerKWh = 0,
  pricePerHour = 0,
  timeFeeEnabled = false,
  platformFeePercent = 5,
  taxPercent = 18,
  discountAmount = 0
}) => {
  // Energy charge
  const safeKWh = Math.max(0, Number(energyConsumedKWh) || 0);
  const safePricePerKWh = Math.max(0, Number(pricePerKWh) || 0);
  const energyCharge = Number((safeKWh * safePricePerKWh).toFixed(2));

  // Time charge - only applied if host has enabled time fee
  let timeCharge = 0;
  const billableHours = Math.max(0, (Number(durationMinutes) || 0) / 60);
  if (timeFeeEnabled && pricePerHour > 0) {
    timeCharge = Number((billableHours * Number(pricePerHour)).toFixed(2));
  }

  // Subtotal
  const subtotal = Number((energyCharge + timeCharge).toFixed(2));

  // Platform Fee (e.g. 5%)
  const platformFee = Number(((subtotal * platformFeePercent) / 100).toFixed(2));

  // Taxes (GST 18% on platform fee + base services)
  const taxableBase = subtotal + platformFee;
  const taxes = Number(((taxableBase * taxPercent) / 100).toFixed(2));

  // Discounts
  const discounts = Math.min(subtotal, Math.max(0, Number(discountAmount) || 0));

  // Final Amount
  const finalAmount = Number(Math.max(0, subtotal + platformFee + taxes - discounts).toFixed(2));

  return {
    energyConsumedKWh: Number(safeKWh.toFixed(2)),
    billableHours: Number(billableHours.toFixed(2)),
    energyCharge,
    timeCharge,
    subtotal,
    platformFee,
    taxes,
    discounts,
    finalAmount,
    currency: 'INR'
  };
};

/**
 * Calculates host earnings and platform commission from a completed transaction
 */
export const calculateHostEarnings = (subtotalAmount, commissionPercent = 10) => {
  const gross = Number(Number(subtotalAmount).toFixed(2));
  const commission = Number(((gross * commissionPercent) / 100).toFixed(2));
  const netEarnings = Number((gross - commission).toFixed(2));

  return {
    grossAmount: gross,
    platformCommissionRate: commissionPercent,
    platformCommissionAmount: commission,
    netHostPayout: netEarnings
  };
};
