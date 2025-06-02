# 🇳🇴 Norway Geodata

📍 Complete administrative geographic data for Norway (2025) with TypeScript support - municipalities, counties, postal codes, and 25+ utility functions.

[![npm version](https://img.shields.io/npm/v/@aprestmo/norway-geodata)](https://www.npmjs.com/package/@aprestmo/norway-geodata)
[![npm downloads](https://img.shields.io/npm/dm/@aprestmo/norway-geodata)](https://www.npmjs.com/package/@aprestmo/norway-geodata)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🏛️ **Complete 2025 data** - All Norwegian municipalities and counties
- 🔒 **TypeScript first** - Full type safety and IntelliSense support
- 🚀 **Zero dependencies** - Lightweight and fast
- 🔍 **Rich search API** - 25+ functions for filtering and statistics
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
  type Municipality,
  type County
} from '@aprestmo/norway-geodata';

// Get all municipalities
const municipalities = getMunicipalities();
console.log(`Found ${municipalities.length} municipalities`);

// Find Oslo
const oslo = getMunicipalityById('0301');
console.log('Oslo population:', oslo?.k_population);

// Search municipalities
const bergMunicipalities = getMunicipalitiesByName('berg');
console.log('Found:', bergMunicipalities.length);

// Get all counties
const counties = getCounties();
console.log(`Found ${counties.length} counties`);
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
  LanguageStatus,
  PopulationDensityStats,
  MunicipalitySearchOptions,
  MunicipalityFilterOptions
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
  console.log(oslo.k_name);       // string
  console.log(oslo.k_population); // number
  console.log(oslo.k_postal_codes); // readonly number[]
}
```

## 📊 Data Types

### Municipality
```typescript
interface Municipality {
  readonly k_id: string;                    // "0301" (Oslo)
  readonly k_name: string;                  // "Oslo"
  readonly k_name_no: string;               // "Oslo"
  readonly k_adm_center: string;            // "Oslo"
  readonly k_population: number;            // 709037
  readonly k_area: number;                  // 454.07
  readonly k_language: LanguageStatus;      // "Nøytral"
  readonly k_url: string;                   // "https://oslo.kommune.no"
  readonly k_postal_codes: readonly number[]; // [179, 180, 181, ...]
}
```

### County
```typescript
interface County {
  readonly f_id: string;    // "03" (Oslo)
  readonly f_name: string;  // "Oslo"
  readonly f_url: string;   // "https://oslo.fylkeskommune.no"
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

type LanguageStatus = 'Nøytral' | 'Bokmål' | 'Nynorsk' | 'Sami' | 'Kvensk';
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

