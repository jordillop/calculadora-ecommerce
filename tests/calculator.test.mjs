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
    platformCommissionPercent: 10,
  });

  assertClose(result.commission, 2);
  assertClose(result.totalCosts, 27);
  assertClose(result.profit, -7);
  assertClose(result.margin, -0.35);
});
