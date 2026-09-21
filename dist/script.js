import { calculate } from "./calculator.mjs";

const form = document.querySelector("#margin-form");
const errorMessage = document.querySelector("#form-error");
const resultPanel = document.querySelector("#result-panel");
const profitResult = document.querySelector("#profit-result");
const marginResult = document.querySelector("#margin-result");
const grossProfitResult = document.querySelector("#gross-profit-result");
const revenueExVatResult = document.querySelector("#revenue-ex-vat-result");
const discountResult = document.querySelector("#discount-result");
const vatResult = document.querySelector("#vat-result");
const commissionResult = document.querySelector("#commission-result");
const costResult = document.querySelector("#cost-result");
const resultNote = document.querySelector("#result-note");

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("es-ES", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function readValues() {
  const data = new FormData(form);
  return {
    productCost: Number(data.get("productCost")),
    shippingCost: Number(data.get("shippingCost")),
    advertisingCost: Number(data.get("advertisingCost")),
    salePrice: Number(data.get("salePrice")),
    vatPercent: Number(data.get("vatPercent")),
    discountPercent: Number(data.get("discountPercent")),
    platformCommissionPercent: Number(data.get("platformCommissionPercent")),
  };
}

function validate(values) {
  let firstInvalid = null;

  for (const input of form.querySelectorAll("input")) {
    const value = input.value.trim();
    const numericValue = Number(value);
    const isBelowMinimum = input.min !== "" && numericValue < Number(input.min);
    const isAboveMaximum = input.max !== "" && numericValue > Number(input.max);
    const isInvalid = value === "" || isBelowMinimum || isAboveMaximum;
    input.setAttribute("aria-invalid", String(isInvalid));
    firstInvalid ||= isInvalid ? input : null;
  }

  if (firstInvalid) {
    errorMessage.textContent = "Revisa los campos e introduce importes válidos.";
    firstInvalid.focus();
    return false;
  }

  if (values.salePrice <= 0) {
    errorMessage.textContent = "El precio de venta debe ser mayor que 0 € para calcular el margen.";
    document.querySelector("#sale-price").focus();
    return false;
  }

  errorMessage.textContent = "";
  return true;
}

function renderResult(result) {
  profitResult.textContent = currency.format(result.profit);
  marginResult.textContent = percent.format(result.margin);
  grossProfitResult.textContent = currency.format(result.grossProfit);
  revenueExVatResult.textContent = currency.format(result.revenueExVat);
  discountResult.textContent = currency.format(result.discountAmount);
  vatResult.textContent = currency.format(result.vatAmount);
  commissionResult.textContent = currency.format(result.commission);
  costResult.textContent = currency.format(result.totalCosts);
  resultPanel.classList.toggle("is-negative", result.profit < 0);
  resultNote.textContent = result.profit >= 0
    ? "El beneficio es positivo después de descontar los costes indicados."
    : "Los costes superan el precio de venta; esta operación genera una pérdida.";
}

function setFormValues(values) {
  document.querySelector("#product-cost").value = values.productCost;
  document.querySelector("#shipping-cost").value = values.shippingCost;
  document.querySelector("#advertising-cost").value = values.advertisingCost;
  document.querySelector("#sale-price").value = values.salePrice;
  document.querySelector("#vat-percent").value = values.vatPercent;
  document.querySelector("#discount-percent").value = values.discountPercent;
  document.querySelector("#platform-commission").value = values.platformCommissionPercent;
}

function registerCalculationTool() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  const schema = {
    type: "object",
    properties: {
      productCost: { type: "number", minimum: 0 },
      shippingCost: { type: "number", minimum: 0 },
      advertisingCost: { type: "number", minimum: 0 },
      salePrice: { type: "number", exclusiveMinimum: 0 },
      vatPercent: { type: "number", minimum: 0, maximum: 100 },
      discountPercent: { type: "number", minimum: 0, maximum: 100 },
      platformCommissionPercent: { type: "number", minimum: 0, maximum: 100 },
    },
    required: ["productCost", "shippingCost", "advertisingCost", "salePrice", "vatPercent", "discountPercent", "platformCommissionPercent"],
    additionalProperties: false,
  };

  void Promise.resolve(context.registerTool({
    name: "calculate_ecommerce_margin",
    title: "Calcular margen ecommerce",
    description: "Calcula el beneficio y el margen de una venta y actualiza el resultado visible de la calculadora.",
    inputSchema: schema,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const values = {
        productCost: Number(input?.productCost),
        shippingCost: Number(input?.shippingCost),
        advertisingCost: Number(input?.advertisingCost),
        salePrice: Number(input?.salePrice),
        vatPercent: Number(input?.vatPercent),
        discountPercent: Number(input?.discountPercent),
        platformCommissionPercent: Number(input?.platformCommissionPercent),
      };

      const isValid = Object.values(values).every(Number.isFinite)
        && values.productCost >= 0
        && values.shippingCost >= 0
        && values.advertisingCost >= 0
        && values.salePrice > 0
        && values.vatPercent >= 0
        && values.vatPercent <= 100
        && values.discountPercent >= 0
        && values.discountPercent <= 100
        && values.platformCommissionPercent >= 0
        && values.platformCommissionPercent <= 100;

      if (!isValid) throw new Error("Los costes deben ser positivos o cero; IVA, descuento y comisión deben estar entre 0 y 100 %; y el precio de venta debe ser mayor que cero.");

      const result = calculate(values);
      setFormValues(values);
      renderResult(result);
      return {
        profit: Number(result.profit.toFixed(2)),
        marginPercent: Number((result.margin * 100).toFixed(1)),
        grossProfit: Number(result.grossProfit.toFixed(2)),
        revenueExVat: Number(result.revenueExVat.toFixed(2)),
        discountAmount: Number(result.discountAmount.toFixed(2)),
        vatAmount: Number(result.vatAmount.toFixed(2)),
        commission: Number(result.commission.toFixed(2)),
        totalCosts: Number(result.totalCosts.toFixed(2)),
      };
    },
  })).catch(() => {});
}

form.addEventListener("input", (event) => {
  event.target.removeAttribute("aria-invalid");
  errorMessage.textContent = "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = readValues();
  if (!validate(values)) return;
  renderResult(calculate(values));
});

registerCalculationTool();
