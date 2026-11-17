#!/usr/bin/env node
// Known facts the history must get right. Run by `npm test` after the build.
const assert = require('assert');
const h = require('../dist/history.js');

// Rånåsfoss lay in Sørum until 2020, then Nes (Viken), today Nes (Akershus).
assert.strictEqual(h.getPostalCodeAt('1927', '2019-12-31').municipalityId, '0226');
assert.strictEqual(h.getPostalCodeAt('1927', '2020-01-01').municipalityId, '3034');
assert.strictEqual(h.getPostalCodeAt('1927', '2026-01-01').municipalityId, '3228');
assert.strictEqual(h.getPostalCodeAt('9999', '2020-01-01'), undefined);

assert.strictEqual(h.getMunicipalityNameAt('0220', '2019-01-01'), 'Asker');
assert.strictEqual(h.getMunicipalityNameAt('0220', '2021-01-01'), undefined);
assert.strictEqual(h.getCountyNameAt('30', '2022-06-01'), 'Viken');
assert.strictEqual(h.getCountyNameAt('30', '2024-06-01'), undefined);

// Asker today is old Asker, Røyken and Hurum.
assert.deepStrictEqual([...h.getMunicipalityLineage('3203').ids].sort(), ['0220', '0627', '0628', '3025', '3203']);
assert.strictEqual(h.getCurrentMunicipalityId('0627'), '3203');
// Haram was part of Ålesund (1507) in 2020–2023: the postal code tells them apart.
assert.strictEqual(h.getCurrentMunicipalityId('1507', '6270'), '1580');
assert.strictEqual(h.getCurrentMunicipalityId('1507', '6003'), '1508');
assert.strictEqual(h.getCurrentMunicipalityId('1507'), '1508');
assert.strictEqual(h.getCurrentMunicipalityId('1534'), '1580');
// A moved border: Rånåsfoss is Nes today, the rest of Sørum is Lillestrøm.
assert.strictEqual(h.getCurrentMunicipalityId('0226', '1927'), '3228');
assert.strictEqual(h.getCurrentMunicipalityId('0226', '1920'), '3205');
assert.strictEqual(h.getCurrentMunicipalityId('0000'), undefined);

// Periods are in order and never overlap. A gap is a postal code that was closed and reopened.
for (const { code, periods } of h.getPostalCodeHistories()) {
  periods.forEach((p, i) => {
    assert.ok(p.to === null || p.from === null || p.from < p.to, `empty period in ${code}`);
    if (i) assert.ok(p.from >= periods[i - 1].to, `overlap in ${code}`);
  });
}
assert.ok(h.getMunicipalityChanges().some((e) => e.kind === 'succession' && e.fromId === '0220' && e.toId === '3025'));
assert.ok(h.getCountyChanges().some((e) => e.fromId === '30' && e.toId === '32'));

console.log('✅ History checks passed');
