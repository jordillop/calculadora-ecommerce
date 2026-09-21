export function calculate(values) {
  const commission = values.salePrice * (values.platformCommissionPercent / 100);
  const totalCosts = values.productCost + values.shippingCost + values.advertisingCost + commission;
  const profit = values.salePrice - totalCosts;
  const margin = profit / values.salePrice;

  return { totalCosts, commission, profit, margin };
}
