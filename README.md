# 🇳🇴 Norway Geodata

📍 Complete administrative geographic data for Norway (2025) with TypeScript support - municipalities, counties, postal codes, and 35+ utility functions.

[![npm version](https://img.shields.io/npm/v/@aprestmo/norway-geodata)](https://www.npmjs.com/package/@aprestmo/norway-geodata)
[![npm downloads](https://img.shields.io/npm/dm/@aprestmo/norway-geodata)](https://www.npmjs.com/package/@aprestmo/norway-geodata)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🏛️ **Complete 2025 data** - All Norwegian municipalities and counties
- 🔒 **TypeScript first** - Full type safety and IntelliSense support
- 🚀 **Zero dependencies** - Lightweight and fast
- 🔍 **Rich search API** - 25+ functions for filtering and statistics
- 🕰️ **History** - Postal codes, municipalities and counties over time, from 2003
- 📦 **Multiple registries** - Available on npm and GitHub Packages

## 📦 Installation

```bash
npm install @aprestmo/norway-geodata
```

<details>
<summary>Alternative: GitHub Packages</summary>

```bash
# Configure npm for GitHub Packages
npm config set @aprestmo:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN

# Install
npm install @aprestmo/norway-geodata
```

> Requires a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `read:packages` permission.

</details>

## 🚀 Quick Start

```typescript
import {
  getMunicipalities,
  getCounties,
  getMunicipalityById,
  getMunicipalitiesByName,
  getAllPostalCodes,
  type Municipality,
  type County
} from '@aprestmo/norway-geodata';

// Get all municipalities
const municipalities = getMunicipalities();
console.log(`Found ${municipalities.length} municipalities`);

// Find Oslo
const oslo = getMunicipalityById('0301');
console.log('Oslo population:', oslo?.population);

// Search municipalities
const bergMunicipalities = getMunicipalitiesByName('berg');
console.log('Found:', bergMunicipalities.length);

// Get all postal codes
const postalCodes = getAllPostalCodes();
console.log(`Found ${postalCodes.length} postal codes`);

// Get postal codes with details
const detailedCodes = getAllPostalCodes(true);
console.log('First postal code:', detailedCodes[0]);
// Output: { code: "0001", place: "Oslo", municipalityId: "0301", municipalityName: "Oslo" }

// Get all counties
const counties = getCounties();
console.log(`Found ${counties.length} counties`);
```

### Working with Postal Codes

```typescript
import {
  getPostalCodes,
  getPostalCodeByCode,
  getPostalCodesByPlace,
  getPostalCodesByMunicipalityId,
  getUniquePostalPlaces,
  isValidPostalCode,
  type PostalCode
} from '@aprestmo/norway-geodata';

// Get all postal codes
const allPostalCodes = getPostalCodes();
console.log(`Total postal codes: ${allPostalCodes.length}`);

// Find a specific postal code
const osloCenter = getPostalCodeByCode('0001');
console.log(osloCenter);
// Output: { code: "0001", place: "Oslo", id: "0301" }

// Search by place name (case-insensitive partial match)
const bergensPostalCodes = getPostalCodesByPlace('bergen');
console.log(`Bergen postal codes: ${bergensPostalCodes.length}`);

// Get postal codes for a municipality
const osloPostalCodes = getPostalCodesByMunicipalityId('0301');
console.log(`Oslo has ${osloPostalCodes.length} postal codes`);

// Check if postal code exists
const isValid = isValidPostalCode('0001');
console.log(`0001 is valid: ${isValid}`);

// Get unique postal places
const uniquePlaces = getUniquePostalPlaces();
console.log(`Unique places: ${uniquePlaces.length}`);
```

## API Reference

### Core Functions

- `getVersion()` - Get library version
- `getMunicipalities()` - Get all municipalities
- `getCounties()` - Get all counties

### Municipality Functions

- `getMunicipalityById(id: string)` - Get municipality by ID
- `getMunicipalitiesByName(name: string, options?: MunicipalitySearchOptions)` - Search by name with options
- `getMunicipalitiesByCounty(countyId: string)` - Get municipalities in county
- `getMunicipalityByPostalCode(postalCode: string | number)` - Get municipality by postal code
- `getPostalCodesByMunicipality(municipalityId: string)` - Get postal codes for municipality
- `getAllPostalCodes(includeDetails?: boolean)` - Get all postal codes, optionally with place names and municipality info
- `getMunicipalitiesByPopulation(ascending?: boolean)` - Sort by population
- `getMunicipalitiesByArea(ascending?: boolean)` - Sort by area
- `getMunicipalitiesByLanguage(language: LanguageStatus)` - Filter by language status
- `getMunicipalitiesFiltered(options: MunicipalityFilterOptions)` - Advanced filtering
- `getMunicipalitiesByPopulationDensity(min?: number, max?: number)` - Filter by density
- `getLargestMunicipalities(count?: number)` - Get largest by population
- `getSmallestMunicipalities(count?: number)` - Get smallest by population

### County Functions

- `getCountyById(id: string)` - Get county by ID
- `getCountyByName(name: string, exactMatch?: boolean)` - Search county by name

### Postal Code Functions

- `getPostalCodes()` - Get all postal codes with metadata
- `getPostalCodeByCode(code: string)` - Get postal code information by code
- `getPostalCodesByPlace(place: string, options?: PostalCodeSearchOptions)` - Search by postal place name
- `getPostalCodesByMunicipalityId(municipalityId: string)` - Get postal codes for municipality
- `getPostalCodesByMunicipalityName(municipalityName: string, exactMatch?: boolean)` - Get postal codes by municipality name
- `getUniquePostalPlaces()` - Get all unique postal place names
- `getPostalCodesInRange(startCode: string, endCode: string)` - Get postal codes within range
- `getPostalCodesSorted(ascending?: boolean)` - Get sorted postal codes
- `getPostalCodesStats()` - Get postal codes statistics
- `isValidPostalCode(code: string)` - Check if postal code exists

### History Functions

Postal codes, municipalities and counties over time, in a separate entry point so the
history (1.3 MB) is only loaded when asked for:

```ts
import {
  getPostalCodeAt,
  getMunicipalityNameAt,
  getCountyNameAt,
  getMunicipalityLineage,
  getCurrentMunicipalityId,
} from '@aprestmo/norway-geodata/history';

// Rånåsfoss lay in Sørum until 2020 and is Nes today
getPostalCodeAt('1927', '2019-12-31'); // { place: 'Rånåsfoss', municipalityId: '0226', ... }
getMunicipalityNameAt('0226', '2019-12-31'); // 'Sørum'
getCountyNameAt('30', '2022-06-01'); // 'Viken'

// Asker today is old Asker, Røyken and Hurum
getMunicipalityLineage('3203')?.ids; // ['3203', '3025', '0628', '0627', '0220']

// Which municipality of today does an old record belong to?
getCurrentMunicipalityId('0627'); // '3203' (Røyken is Asker today)
getCurrentMunicipalityId('1507', '6270'); // '1580' (Brattvåg: Haram, part of Ålesund 2020–2023)
```

- `getPostalCodeHistory(code)` / `getPostalCodeHistories()` - A postal code's periods: place, municipality ID and category
- `getPostalCodeAt(code, date)` - What a postal code was on a date
- `getMunicipalityHistory(id)` / `getMunicipalityHistories()` - The names a municipality ID has had, also IDs no longer in use
- `getCountyHistory(id)` / `getCountyHistories()` - The same for counties
- `getMunicipalityNameAt(id, date)` / `getCountyNameAt(id, date)` - The name on a date
- `getMunicipalityChanges()` / `getCountyChanges()` - Statistics Norway's list of changes (`succession`, `transfer`, `renamed`)
- `getMunicipalityLineage(id)` - Every ID since 2003 that makes up a municipality of today
- `getCurrentMunicipalityId(id, postalCode?)` - The municipality of today for an ID as it was at the time

Dates are ISO strings. A period runs from `from` (inclusive) to `to` (exclusive); `null` means
before the data starts, or still valid. The raw files are also exported: `@aprestmo/norway-geodata/data/history/postal-codes` and so on.

**Sources and limits.** Municipalities and counties come from Statistics Norway (Klass 131 and 104),
from 2003-01-01. Postal codes come from Posten: today's register played backwards through Posten's
log of every change since 2003-10-01. The result matches archived registers from 2019, 2020 and 2022,
except for one post box code where Posten's own register has a municipality ID that does not exist.
Posten keeps a postal code on one municipality only, so a postal code that crosses a border is listed
on one side. Where an old municipality was divided (Snillfjord, Tysfjord, Stokke, Ålesund/Haram) or a
border was moved (Rånåsfoss, Vågstranda and eight more), the lineage splits the old ID by postal code.
Rebuild with `npm run build:history` (Python 3, standard library only); a monthly workflow does it and opens a
pull request when the sources have changed. See [PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md).

### Statistics Functions

- `getTotalPopulation(): number` - Total population of Norway
- `getTotalArea(): number` - Total area of Norway
- `getPopulationDensityStats(): PopulationDensityStats` - Population density statistics

### Type Exports

All TypeScript interfaces and types are exported:

```typescript
import type {
  Municipality,
  County,
  PostalCode,
  LanguageStatus,
  PopulationDensityStats,
  MunicipalitySearchOptions,
  MunicipalityFilterOptions,
  PostalCodeSearchOptions
} from '@aprestmo/norway-geodata';
```

## 🎯 TypeScript Support

Full TypeScript support with strict type safety:

```typescript
import type {
  Municipality,
  County,
  LanguageStatus,
  MunicipalitySearchOptions,
  MunicipalityFilterOptions
} from '@aprestmo/norway-geodata';

// Type-safe operations
const oslo: Municipality | undefined = getMunicipalityById('0301');
if (oslo) {
  // Full IntelliSense support
  console.log(oslo.name);       // string
  console.log(oslo.population); // number
  console.log(oslo.postal_codes); // readonly number[]
}
```

## 📊 Data Types

### Municipality
```typescript
interface Municipality {
  readonly id: string;                    // "0301" (Oslo)
  readonly name: string;                  // "Oslo"
  readonly name_no: string;               // "Oslo"
  readonly adm_center: string;            // "Oslo"
  readonly population: number;            // 709037
  readonly area: number;                  // 454.07
  readonly language: LanguageStatus;      // "Nøytral"
  readonly url: string;                   // "https://oslo.kommune.no"
  readonly postal_codes: readonly number[]; // [179, 180, 181, ...]
}
```

### County
```typescript
interface County {
  readonly id: string;    // "03" (Oslo)
  readonly name: string;  // "Oslo"
  readonly url: string;   // "https://oslo.fylkeskommune.no"
}
```

### PostalCode
```typescript
interface PostalCode {
  readonly code: string;    // "0001"
  readonly place: string;   // "Oslo"
  readonly id: string;             // "0301" (municipality ID)
}
```

### Options
```typescript
interface MunicipalitySearchOptions {
  readonly includeAllNames?: boolean;   // Search both EN/NO names
  readonly caseSensitive?: boolean;     // Case sensitive
  readonly exactMatch?: boolean;        // Exact match only
}

interface MunicipalityFilterOptions {
  readonly minPopulation?: number;
  readonly maxPopulation?: number;
  readonly minArea?: number;            // km²
  readonly maxArea?: number;            // km²
  readonly language?: LanguageStatus;
  readonly countyId?: string;
}

interface PostalCodeSearchOptions {
  readonly caseSensitive?: boolean;     // Case sensitive search
  readonly exactMatch?: boolean;        // Exact match only
}

type LanguageStatus = 'Nøytral' | 'Bokmål' | 'Nynorsk';
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Quick Start
1. Fork the repository
2. Create a feature branch  
3. Make your changes
4. Create a pull request

All contributions go through automated validation and testing.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 📊 Package Info

- **npm**: [@aprestmo/norway-geodata](https://www.npmjs.com/package/@aprestmo/norway-geodata)
- **GitHub**: [aprestmo/norway-geodata](https://github.com/aprestmo/norway-geodata)
- **Data**: Norwegian administrative data (2025)
- **License**: MIT

