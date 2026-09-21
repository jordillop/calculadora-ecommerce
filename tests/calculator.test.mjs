import assert from "node:assert/strict";
import test from "node:test";

import { calculate } from "../dist/calculator.mjs";

function assertClose(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Se esperaba ${expected}, pero se obtuvo ${actual}`,
  );
}

test("calcula comisión, costes, beneficio y margen en una venta rentable", () => {
  const result = calculate({
    productCost: 20,
    shippingCost: 5,
    advertisingCost: 10,
    salePrice: 100,
    vatPercent: 0,
    discountPercent: 0,
    platformCommissionPercent: 15,
  });

  assertClose(result.commission, 15);
  assertClose(result.totalCosts, 50);
  assertClose(result.profit, 50);
  assertClose(result.margin, 0.5);
});

test("calcula el margen sobre el precio de venta y evita la regresión del 105,5 %", () => {
  const result = calculate({
    productCost: 6.6,
    shippingCost: 2,
    advertisingCost: 3,
    salePrice: 30,
    vatPercent: 0,
    discountPercent: 0,
    platformCommissionPercent: 10,
  });

  assertClose(result.commission, 3);
  assertClose(result.totalCosts, 14.6);
  assertClose(result.profit, 15.4);
  assertClose(result.margin, 15.4 / 30);
  assert.equal(Number((result.margin * 100).toFixed(1)), 51.3);
});

test("admite una comisión de plataforma del 0 %", () => {
  const result = calculate({
    productCost: 10,
    shippingCost: 5,
    advertisingCost: 5,
    salePrice: 50,
    vatPercent: 0,
    discountPercent: 0,
    platformCommissionPercent: 0,
  });

  assertClose(result.commission, 0);
  assertClose(result.totalCosts, 20);
  assertClose(result.profit, 30);
  assertClose(result.margin, 0.6);
});

test("devuelve beneficio y margen negativos cuando hay pérdidas", () => {
  const result = calculate({
    productCost: 18,
    shippingCost: 5,
    advertisingCost: 2,
    salePrice: 20,
    vatPercent: 0,
    discountPercent: 0,
    platformCommissionPercent: 10,
  });

  assertClose(result.commission, 2);
  assertClose(result.totalCosts, 27);
  assertClose(result.profit, -7);
  assertClose(result.margin, -0.35);
});

test("aplica el descuento antes de separar el IVA y calcular los ingresos", () => {
  const result = calculate({
    productCost: 40,
    shippingCost: 5,
    advertisingCost: 10,
    salePrice: 121,
    vatPercent: 21,
    discountPercent: 10,
    platformCommissionPercent: 10,
  });

  assertClose(result.discountAmount, 12.1);
  assertClose(result.discountedSalePrice, 108.9);
  assertClose(result.revenueExVat, 90);
  assertClose(result.vatAmount, 18.9);
  assertClose(result.grossProfit, 50);
  assertClose(result.commission, 10.89);
  assertClose(result.totalCosts, 65.89);
  assertClose(result.profit, 24.11);
  assertClose(result.margin, 24.11 / 90);
});

test("calcula correctamente con IVA del 0 %", () => {
  const result = calculate({
    productCost: 20,
    shippingCost: 5,
    advertisingCost: 5,
    salePrice: 100,
    vatPercent: 0,
    discountPercent: 10,
    platformCommissionPercent: 10,
  });

  assertClose(result.discountAmount, 10);
  assertClose(result.revenueExVat, 90);
  assertClose(result.vatAmount, 0);
  assertClose(result.grossProfit, 70);
  assertClose(result.profit, 51);
  assertClose(result.margin, 51 / 90);
});

test("calcula correctamente con descuento del 0 %", () => {
  const result = calculate({
    productCost: 40,
    shippingCost: 5,
    advertisingCost: 10,
    salePrice: 120,
    vatPercent: 20,
    discountPercent: 0,
    platformCommissionPercent: 10,
  });

  assertClose(result.discountAmount, 0);
  assertClose(result.revenueExVat, 100);
  assertClose(result.vatAmount, 20);
  assertClose(result.grossProfit, 60);
  assertClose(result.commission, 12);
  assertClose(result.profit, 33);
  assertClose(result.margin, 0.33);
});
