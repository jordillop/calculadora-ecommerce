export function calculate(values) {
  const discountAmount = values.salePrice * (values.discountPercent / 100);
  const discountedSalePrice = values.salePrice - discountAmount;
  const revenueExVat = discountedSalePrice / (1 + values.vatPercent / 100);
  const vatAmount = discountedSalePrice - revenueExVat;
  const commission = discountedSalePrice * (values.platformCommissionPercent / 100);
  const grossProfit = revenueExVat - values.productCost;
  const totalCosts = values.productCost + values.shippingCost + values.advertisingCost + commission;
  const profit = revenueExVat - totalCosts;
  const margin = revenueExVat === 0 ? 0 : profit / revenueExVat;

  return {
    commission,
    discountAmount,
    discountedSalePrice,
    grossProfit,
    margin,
    profit,
    revenueExVat,
    totalCosts,
    vatAmount,
  };
}
