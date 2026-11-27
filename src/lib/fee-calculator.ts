export interface FeeCalculation {
  sellingPrice: number;
  feeAmount: number;
  consignorAmount: number;
  feeType: "FLAT" | "PERCENTAGE";
  feeRateText: string;
}

export interface CheckoutBreakdown {
  itemsTotal: number;
  shippingCost: number;
  insuranceCost: number;
  totalPayment: number;
}

/**
 * Sesuai PRD Bagian 3:
 * - Harga jual <= Rp 200.000 -> Fee tetap Rp 10.000
 * - Harga jual > Rp 200.000 -> Fee 5% dari harga jual akhir
 * - Consignor menerima: Harga Jual - Fee
 */
export function calculateConsignmentFee(price: number, feeSettings?: {
  threshold?: number;
  flatUnder?: number;
  percentAbove?: number;
}): FeeCalculation {
  const threshold = feeSettings?.threshold ?? 200000;
  const flatUnder = feeSettings?.flatUnder ?? 10000;
  const percentAbove = feeSettings?.percentAbove ?? 0.05;

  let feeAmount = 0;
  let feeType: "FLAT" | "PERCENTAGE" = "FLAT";
  let feeRateText = `Rp ${flatUnder.toLocaleString("id-ID")}`;

  if (price <= threshold) {
    feeAmount = flatUnder;
    feeType = "FLAT";
    feeRateText = `Rp ${flatUnder.toLocaleString("id-ID")} (Flat)`;
  } else {
    feeAmount = Math.round(price * percentAbove);
    feeType = "PERCENTAGE";
    feeRateText = `${percentAbove * 100}%`;
  }

  const consignorAmount = Math.max(0, price - feeAmount);

  return {
    sellingPrice: price,
    feeAmount,
    consignorAmount,
    feeType,
    feeRateText,
  };
}

/**
 * PRD Bagian 3:
 * - Ongkir dummy: default Rp 18.000
 * - Asuransi dummy: Rp 5.000 wajib untuk barang berharga > Rp 500.000
 */
export function calculateOrderBreakdown(
  items: { current_listing_price?: number; price?: number }[],
  settings?: {
    dummyShipping?: number;
    insuranceThreshold?: number;
    dummyInsurance?: number;
  }
): CheckoutBreakdown {
  const dummyShipping = settings?.dummyShipping ?? 18000;
  const insuranceThreshold = settings?.insuranceThreshold ?? 500000;
  const dummyInsurance = settings?.dummyInsurance ?? 5000;

  const itemsTotal = items.reduce((sum, item) => {
    return sum + (item.current_listing_price ?? item.price ?? 0);
  }, 0);

  // Asuransi dihitung jika ada barang dengan harga > insuranceThreshold
  const hasHighValueItem = items.some(
    (item) => (item.current_listing_price ?? item.price ?? 0) > insuranceThreshold
  );

  const insuranceCost = hasHighValueItem ? dummyInsurance : 0;
  const shippingCost = items.length > 0 ? dummyShipping : 0;
  const totalPayment = itemsTotal + shippingCost + insuranceCost;

  return {
    itemsTotal,
    shippingCost,
    insuranceCost,
    totalPayment,
  };
}
