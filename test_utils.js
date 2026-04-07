import { decomposeAcres, acresCentsToDecimal } from './client/src/utils/priceUtils.ts';

const testCases = [
  { input: 1.9999, expected: { acres: 2, cents: 0 } },
  { input: 1.05, expected: { acres: 1, cents: 5 } },
  { input: 0.999, expected: { acres: 1, cents: 0 } },
  { input: 2.50, expected: { acres: 2, cents: 50 } },
  { input: 0.005, expected: { acres: 0, cents: 1 } },
  { input: 15.00000000000001, expected: { acres: 15, cents: 0 } }
];

console.log("--- Decompose Acres Tests ---");
testCases.forEach(tc => {
  const result = decomposeAcres(tc.input);
  const match = result.acres === tc.expected.acres && result.cents === tc.expected.cents;
  console.log(`Input: ${tc.input} -> Result: ${result.acres}A ${result.cents}C | ${match ? 'PASS' : 'FAIL'}`);
});

console.log("\n--- Reverse Conversion Tests ---");
const reverseTests = [
  { a: 1, c: 5, expected: 1.05 },
  { a: 2, c: 50, expected: 2.5 },
  { a: 0, c: 99, expected: 0.99 }
];
reverseTests.forEach(tc => {
  const result = acresCentsToDecimal(tc.a, tc.c);
  const match = result === tc.expected;
  console.log(`Input: ${tc.a}A, ${tc.c}C -> Result: ${result} | ${match ? 'PASS' : 'FAIL'}`);
});
