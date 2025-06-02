# Norway Geodata

📍 Administrative geographic data for Norway including municipalities (kommuner), counties (fylker), and postal codes.

## Features

- **Complete Norwegian geodata** for 2025
- **Full TypeScript support** with strict type safety
- **Semantic versioning** with automatic npm publishing
- **Comprehensive API** with 25+ functions for search, filtering, and statistics
- **Data validation** with automated CI/CD workflows
- **Zero runtime dependencies** - lightweight and fast

## Installation

### From npm (recommended)
```bash
npm install @aprestmo/norway-geodata
```

### From GitHub Packages
```bash
# Configure npm to use GitHub Packages for @aprestmo scope
npm config set @aprestmo:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN

# Install the package
npm install @aprestmo/norway-geodata
```

Note: For GitHub Packages, you need a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `read:packages` permission.

## Usage

```typescript
import {
  getMunicipalities,
  getCounties,
  getMunicipalityById,
  getMunicipalitiesByName,
  getVersion,
  type Municipality,
  type County,
  type MunicipalitySearchOptions
} from '@aprestmo/norway-geodata';

// Get version info
console.log('Library version:', getVersion());

// Get all municipalities with full type safety
const municipalities: readonly Municipality[] = getMunicipalities();
console.log(`Found ${municipalities.length} municipalities`);

// Get Oslo municipality with type safety
const oslo: Municipality | undefined = getMunicipalityById('0301');
if (oslo) {
  console.log('Oslo population:', oslo.k_population);
  console.log('Oslo postal codes:', oslo.k_postal_codes.length);
}

// Advanced search with typed options
const searchOptions: MunicipalitySearchOptions = {
  exactMatch: false,
  caseSensitive: false,
  includeAllNames: true
};
const bergMunicipalities = getMunicipalitiesByName('berg', searchOptions);
console.log('Municipalities with "berg" in name:', bergMunicipalities.length);

// Type-safe county operations
const counties: readonly County[] = getCounties();
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

## Semantic Versioning & Automatic Publishing

This package uses **semantic versioning** with automated npm publishing through GitHub Actions:

### Version Bump Rules

- **Data changes** (`data/*.json`) → **Minor version** bump (e.g., 1.0.0 → 1.1.0)
- **Code changes** (`src/*.js`) → **Patch version** bump (e.g., 1.0.0 → 1.0.1)
- **Manual releases** → **Configurable** (patch, minor, major, prerelease)

### Automatic Publishing Triggers

1. **Push to main/master** with changes to:
   - `data/**/*.json` files
   - `src/**/*.js` files
   - `package.json`

2. **Manual trigger** via GitHub Actions with version type selection

### Workflow Features

- ✅ **Data validation** - Validates JSON structure and API compatibility
- 🔍 **Change detection** - Automatically determines appropriate version bump
- 📝 **Changelog generation** - Creates release notes
- 🏷️ **Git tagging** - Creates semantic version tags
- 📦 **NPM publishing** - Publishes to npm with provenance
- 🚀 **GitHub releases** - Creates GitHub releases with changelogs
- 🔒 **Security** - Uses npm provenance for supply chain security

### Manual Release

To manually trigger a release:

1. Go to **Actions** tab in GitHub
2. Select **Auto Publish to NPM** workflow
3. Click **Run workflow**
4. Choose version bump type:
   - `patch` - Bug fixes (1.0.0 → 1.0.1)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `major` - Breaking changes (1.0.0 → 2.0.0)
   - `prerelease` - Pre-release (1.0.0 → 1.0.1-0)

## Data Structure

### Municipality Interface (TypeScript)
```typescript
interface Municipality {
  readonly k_id: string;                    // 4-digit municipality ID
  readonly k_name: string;                  // Municipality name
  readonly k_name_no: string;               // Municipality name in Norwegian
  readonly k_adm_center: string;            // Administrative center
  readonly k_population: number;            // Population count
  readonly k_area: number;                  // Area in square kilometers
  readonly k_language: LanguageStatus;      // Official language status
  readonly k_url: string;                   // Official website
  readonly k_postal_codes: readonly number[]; // Array of postal codes
}
```

### County Interface (TypeScript)
```typescript
interface County {
  readonly f_id: string;    // 2-digit county ID
  readonly f_name: string;  // County name
  readonly f_url: string;   // Official website
}
```

### Language Status Type
```typescript
type LanguageStatus = 'Nøytral' | 'Bokmål' | 'Nynorsk' | 'Sami' | 'Kvensk';
```

### Search and Filter Options
```typescript
interface MunicipalitySearchOptions {
  readonly includeAllNames?: boolean;   // Search both English and Norwegian names
  readonly caseSensitive?: boolean;     // Case sensitive search
  readonly exactMatch?: boolean;        // Exact match only
}

interface MunicipalityFilterOptions {
  readonly minPopulation?: number;      // Minimum population
  readonly maxPopulation?: number;      // Maximum population
  readonly minArea?: number;            // Minimum area (km²)
  readonly maxArea?: number;            // Maximum area (km²)
  readonly language?: LanguageStatus;   // Language status
  readonly countyId?: string;           // County ID
}
```

## Development

### Setup

```bash
git clone https://github.com/aprestmo/norway-geodata.git
cd norway-geodata
npm install
```

### Scripts

```bash
npm run build        # Compile TypeScript to JavaScript
npm run build:watch  # Watch mode compilation
npm run clean        # Clean dist folder
npm test             # Build and run validation tests
npm run test:types   # TypeScript type checking only
npm run validate     # Validate JSON files
npm run dev          # Development mode (watch compilation)
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass: `npm test`
5. Create a pull request

The automated workflows will:
- **TypeScript compilation** and type checking
- **Data structure validation** and API compatibility testing
- **Automated npm publishing** on merge to main
- **GitHub releases** with changelogs

## License

MIT License - see LICENSE file for details.

## Data Sources

Norwegian administrative data for 2025.

---

📦 **Package**: [@aprestmo/norway-geodata](https://www.npmjs.com/package/@aprestmo/norway-geodata)  
🏷️ **Version**: ![npm version](https://img.shields.io/npm/v/@aprestmo/norway-geodata)  
📊 **Downloads**: ![npm downloads](https://img.shields.io/npm/dm/@aprestmo/norway-geodata)

