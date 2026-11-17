/**
 * Postal codes, municipalities and counties over time.
 *
 * A separate entry point (`@aprestmo/norway-geodata/history`), so the 1.3 MB of history is
 * only loaded by those who ask for it. The data is built by scripts/build-history.py from
 * Statistics Norway (Klass 131 and 104) and Posten's log of postal code changes.
 * Postal codes go back to 2003-10-01, municipalities and counties to 2003-01-01.
 *
 * Dates are ISO strings (`2020-01-01`). A period runs from `from` (inclusive) to `to`
 * (exclusive); `from: null` means before the data starts, `to: null` means still valid.
 */
import postalCodesData from '../data/history/postal-codes.json';
import municipalitiesData from '../data/history/municipalities.json';
import countiesData from '../data/history/counties.json';
import municipalityChangesData from '../data/history/municipality-changes.json';
import countyChangesData from '../data/history/county-changes.json';
import lineageData from '../data/history/municipality-lineage.json';

/** A span of time. */
export interface Period {
  /** First day, or null when it started before the data does */
  readonly from: string | null;
  /** The day it ended, or null when still valid */
  readonly to: string | null;
}

/** What a postal code was in one period. Posten keeps a postal code on one municipality only. */
export interface PostalCodePeriod extends Period {
  readonly place: string;
  /** 4-digit municipality ID valid at the time */
  readonly municipalityId: string;
  /** Posten's category: G street, P post box, B both, S service, F multiple, K customer */
  readonly category: string;
}

export interface PostalCodeHistory {
  readonly code: string;
  readonly periods: readonly PostalCodePeriod[];
}

export interface NamePeriod extends Period {
  readonly name: string;
}

/** A municipality or county ID with the names it has had. */
export interface AreaHistory {
  readonly id: string;
  readonly periods: readonly NamePeriod[];
}

/**
 * One line of Statistics Norway's list of changes.
 * - `succession`: the old ID ended and went into the new one (new number, merger or division)
 * - `transfer`: the old ID lives on and gave some area to the new one
 * - `renamed`: same ID, new name
 */
export interface AreaChange {
  readonly date: string;
  readonly kind: 'succession' | 'transfer' | 'renamed';
  readonly fromId: string;
  readonly fromName: string;
  readonly toId: string;
  readonly toName: string;
}

/** An earlier municipality ID only a part of which belongs to the municipality of today. */
export interface LineagePart {
  readonly id: string;
  /** The postal codes that tell the part apart */
  readonly postalCodes: readonly string[];
  /** true: these postal codes belong here. false: everything but these does. */
  readonly included: boolean;
}

/** Every municipality ID since 2008 that makes up a municipality of today. */
export interface MunicipalityLineage {
  readonly id: string;
  readonly name: string;
  /** IDs that belong here in full, today's own among them */
  readonly ids: readonly string[];
  /** IDs shared with another municipality, split by postal code */
  readonly parts: readonly LineagePart[];
}

const postalCodes = postalCodesData as readonly PostalCodeHistory[];
const municipalities = municipalitiesData as readonly AreaHistory[];
const counties = countiesData as readonly AreaHistory[];
const municipalityChanges = municipalityChangesData as readonly AreaChange[];
const countyChanges = countyChangesData as readonly AreaChange[];
const lineage = lineageData as readonly MunicipalityLineage[];

const byCode = new Map(postalCodes.map((e) => [e.code, e]));
const municipalityById = new Map(municipalities.map((e) => [e.id, e]));
const countyById = new Map(counties.map((e) => [e.id, e]));
const lineageById = new Map(lineage.map((e) => [e.id, e]));

const covers = (period: Period, date: string): boolean =>
  (period.from === null || period.from <= date) && (period.to === null || date < period.to);

/** Every postal code that has existed since 2003, with its periods oldest first. */
export function getPostalCodeHistories(): readonly PostalCodeHistory[] {
  return postalCodes;
}

/** The periods of one postal code, oldest first. */
export function getPostalCodeHistory(code: string): PostalCodeHistory | undefined {
  return byCode.get(code);
}

/**
 * What a postal code was on a date: place and the municipality ID valid then.
 * @param date - ISO date, e.g. "2019-12-31"
 * @returns undefined when the postal code did not exist on that date
 */
export function getPostalCodeAt(code: string, date: string): PostalCodePeriod | undefined {
  return byCode.get(code)?.periods.find((e) => covers(e, date));
}

/** Every municipality ID in use since 2003, with the names it has had. */
export function getMunicipalityHistories(): readonly AreaHistory[] {
  return municipalities;
}

/** The names a municipality ID has had. Also for IDs no longer in use, e.g. "0220". */
export function getMunicipalityHistory(id: string): AreaHistory | undefined {
  return municipalityById.get(id);
}

/** Every county ID in use since 2003, with the names it has had. */
export function getCountyHistories(): readonly AreaHistory[] {
  return counties;
}

/** The names a county ID has had. Also for IDs no longer in use, e.g. "30" (Viken). */
export function getCountyHistory(id: string): AreaHistory | undefined {
  return countyById.get(id);
}

/** The name a municipality ID had on a date, or undefined when it was not in use. */
export function getMunicipalityNameAt(id: string, date: string): string | undefined {
  return municipalityById.get(id)?.periods.find((e) => covers(e, date))?.name;
}

/** The name a county ID had on a date, or undefined when it was not in use. */
export function getCountyNameAt(id: string, date: string): string | undefined {
  return countyById.get(id)?.periods.find((e) => covers(e, date))?.name;
}

/** Statistics Norway's changes to municipalities since 2003, oldest first. */
export function getMunicipalityChanges(): readonly AreaChange[] {
  return municipalityChanges;
}

/** Statistics Norway's changes to counties since 2003, oldest first. */
export function getCountyChanges(): readonly AreaChange[] {
  return countyChanges;
}

/**
 * The earlier IDs (since 2008) that make up a municipality of today.
 * @param id - ID of a municipality of today, e.g. "3203" (Asker)
 */
export function getMunicipalityLineage(id: string): MunicipalityLineage | undefined {
  return lineageById.get(id);
}

/**
 * The municipality of today a record belongs to, from the ID it had at the time.
 * The postal code settles it where the old municipality was divided or a border was moved.
 * @param id - Municipality ID as it was at the time, e.g. "1507" (Ålesund 2020–2023)
 * @param postalCode - The record's postal code, when known
 * @returns ID of the municipality of today, or undefined for an unknown ID
 */
export function getCurrentMunicipalityId(id: string, postalCode?: string): string | undefined {
  let rest: string | undefined;
  for (const entry of lineage) {
    if (entry.ids.includes(id)) return entry.id;
    const part = entry.parts.find((e) => e.id === id);
    if (!part) continue;
    if (part.included) {
      if (postalCode !== undefined && part.postalCodes.includes(postalCode)) return entry.id;
    } else {
      // Everything the others did not get, also an unknown postal code.
      rest = entry.id;
    }
  }
  return rest;
}
