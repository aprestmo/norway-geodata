import municipalitiesData from '../data/municipalities-2025.json';
import countiesData from '../data/counties-2025.json';
import postalCodesData from '../data/postal-codes-2025.json';
import packageJson from '../package.json';
import type {
  Municipality,
  County,
  PostalCode,
  PopulationDensityStats,
  LanguageStatus,
  MunicipalitySearchOptions,
  MunicipalityFilterOptions,
  PostalCodeSearchOptions
} from './types';

// Type-safe data imports
const municipalities: readonly Municipality[] = municipalitiesData as unknown as Municipality[];
const counties: readonly County[] = countiesData as County[];
const postalCodes: readonly PostalCode[] = postalCodesData as PostalCode[];

/**
 * Get the library version following semantic versioning.
 * @returns Version string (e.g., "1.0.0")
 */
export function getVersion(): string {
  return packageJson.version;
}

/**
 * Get all municipalities with metadata.
 * @returns Array of all municipalities
 */
export function getMunicipalities(): readonly Municipality[] {
  return municipalities;
}

/**
 * Get a municipality by municipality ID.
 * @param id - 4-digit municipality ID (e.g., "0301" for Oslo)
 * @returns Municipality object or undefined if not found
 * @throws {TypeError} If id is not a string
 */
export function getMunicipalityById(id: string): Municipality | undefined {
  if (typeof id !== 'string') {
    throw new TypeError('Municipality ID must be a string');
  }
  return municipalities.find(m => m.id === id);
}

/**
 * Get municipalities by name (case-insensitive partial match by default).
 * @param name - Municipality name or partial name to search for
 * @param options - Search options
 * @returns Array of matching municipalities
 * @throws {TypeError} If name is not a string
 */
export function getMunicipalitiesByName(
  name: string,
  options: MunicipalitySearchOptions = {}
): Municipality[] {
  if (typeof name !== 'string') {
    throw new TypeError('Municipality name must be a string');
  }
  
  const {
    includeAllNames = true,
    caseSensitive = false,
    exactMatch = false
  } = options;
  
  const searchTerm = caseSensitive ? name : name.toLowerCase();
  
  return municipalities.filter(m => {
    const namesToSearch = includeAllNames 
      ? [m.name, m.name_no]
      : [m.name];
    
    return namesToSearch.some(municipalityName => {
      const compareString = caseSensitive 
        ? municipalityName 
        : municipalityName.toLowerCase();
      
      return exactMatch 
        ? compareString === searchTerm
        : compareString.includes(searchTerm);
    });
  });
}

/**
 * Get all counties (fylker) with metadata.
 * @returns Array of all counties
 */
export function getCounties(): readonly County[] {
  return counties;
}

/**
 * Get a county by county ID.
 * @param id - 2-digit county ID (e.g., "03" for Oslo)
 * @returns County object or undefined if not found
 * @throws {TypeError} If id is not a string
 */
export function getCountyById(id: string): County | undefined {
  if (typeof id !== 'string') {
    throw new TypeError('County ID must be a string');
  }
  return counties.find(f => f.id === id);
}

/**
 * Get county by name (case-insensitive partial match).
 * @param name - County name or partial name to search for
 * @param exactMatch - Whether to match exactly (default: false)
 * @returns County object or undefined if not found
 * @throws {TypeError} If name is not a string
 */
export function getCountyByName(name: string, exactMatch: boolean = false): County | undefined {
  if (typeof name !== 'string') {
    throw new TypeError('County name must be a string');
  }
  const searchTerm = name.toLowerCase();
  return counties.find(f => {
    const countyName = f.name.toLowerCase();
    return exactMatch ? countyName === searchTerm : countyName.includes(searchTerm);
  });
}

/**
 * Get all municipalities in a given county.
 * @param countyId - 2-digit county ID (first two digits of municipality id)
 * @returns Array of municipalities in the county
 * @throws {TypeError} If countyId is not a string
 */
export function getMunicipalitiesByCounty(countyId: string): Municipality[] {
  if (typeof countyId !== 'string') {
    throw new TypeError('County ID must be a string');
  }
  return municipalities.filter(m => m.id.startsWith(countyId));
}

/**
 * Get municipality by postal code.
 * @param postalCode - Postal code to search for
 * @returns Municipality object or undefined if not found
 * @throws {TypeError} If postal code is not a valid number
 */
export function getMunicipalityByPostalCode(postalCode: string | number): Municipality | undefined {
  const code = String(postalCode);
  if (!code.match(/^\d{4}$/)) {
    throw new TypeError('Postal code must be a valid 4-digit number');
  }
  return municipalities.find(m => m.postal_codes.some(pc => pc.code === code));
}

/**
 * Get all postal codes for a specific municipality.
 * @param municipalityId - 4-digit municipality ID
 * @returns Array of postal codes or undefined if municipality not found
 */
export function getPostalCodesByMunicipality(municipalityId: string): readonly string[] | undefined {
  const municipality = getMunicipalityById(municipalityId);
  return municipality ? municipality.postal_codes.map(pc => pc.code) : undefined;
}

/**
 * Get all postal codes from all municipalities.
 * @param includeDetails - If true, returns objects with postal code and place name. If false, returns only postal codes (default: false)
 * @returns Array of postal codes or postal code objects
 */
export function getAllPostalCodes(includeDetails: boolean = false): readonly string[] | readonly { zip: string; place: string; municipalityId: string; municipalityName: string }[] {
  if (includeDetails) {
    const allPostalCodes: { zip: string; place: string; municipalityId: string; municipalityName: string }[] = [];
    municipalities.forEach(municipality => {
      municipality.postal_codes.forEach(pc => {
        allPostalCodes.push({
          code: pc.code,
          place: pc.place,
          municipalityId: municipality.id,
          municipalityName: municipality.name
        });
      });
    });
    return allPostalCodes.sort((a, b) => a.zip.localeCompare(b.zip));
  } else {
    const allPostalCodes = new Set<string>();
    municipalities.forEach(municipality => {
      municipality.postal_codes.forEach(pc => {
        allPostalCodes.add(pc.code);
      });
    });
    return Array.from(allPostalCodes).sort();
  }
}

/**
 * Get municipalities sorted by population.
 * @param ascending - Sort in ascending order if true (default: false for descending)
 * @returns Array of municipalities sorted by population
 */
export function getMunicipalitiesByPopulation(ascending: boolean = false): Municipality[] {
  const sorted = [...municipalities].sort((a, b) => 
    ascending ? a.population - b.population : b.population - a.population
  );
  return sorted;
}

/**
 * Get municipalities sorted by area.
 * @param ascending - Sort in ascending order if true (default: false for descending)
 * @returns Array of municipalities sorted by area
 */
export function getMunicipalitiesByArea(ascending: boolean = false): Municipality[] {
  const sorted = [...municipalities].sort((a, b) => 
    ascending ? a.area - b.area : b.area - a.area
  );
  return sorted;
}

/**
 * Get municipalities by language status.
 * @param language - Language status
 * @returns Array of municipalities with the specified language status
 * @throws {TypeError} If language is not a string
 */
export function getMunicipalitiesByLanguage(language: LanguageStatus): Municipality[] {
  if (typeof language !== 'string') {
    throw new TypeError('Language must be a string');
  }
  return municipalities.filter(m => m.language === language);
}

/**
 * Get municipalities with advanced filtering options.
 * @param options - Filter options
 * @returns Array of municipalities matching the filter criteria
 */
export function getMunicipalitiesFiltered(options: MunicipalityFilterOptions): Municipality[] {
  return municipalities.filter(m => {
    if (options.minPopulation !== undefined && m.population < options.minPopulation) return false;
    if (options.maxPopulation !== undefined && m.population > options.maxPopulation) return false;
    if (options.minArea !== undefined && m.area < options.minArea) return false;
    if (options.maxArea !== undefined && m.area > options.maxArea) return false;
    if (options.language !== undefined && m.language !== options.language) return false;
    if (options.countyId !== undefined && !m.id.startsWith(options.countyId)) return false;
    return true;
  });
}

/**
 * Get total population of all municipalities.
 * @returns Total population
 */
export function getTotalPopulation(): number {
  return municipalities.reduce((total, m) => total + m.population, 0);
}

/**
 * Get total area of all municipalities.
 * @returns Total area in square kilometers
 */
export function getTotalArea(): number {
  return municipalities.reduce((total, m) => total + m.area, 0);
}

/**
 * Get population density statistics.
 * @returns Object with min, max, and average population density
 */
export function getPopulationDensityStats(): PopulationDensityStats {
  const densities = municipalities.map(m => m.population / m.area);
  return {
    min: Math.min(...densities),
    max: Math.max(...densities),
    average: densities.reduce((sum, d) => sum + d, 0) / densities.length
  };
}

/**
 * Get municipalities by population density range.
 * @param minDensity - Minimum population density (people per km²)
 * @param maxDensity - Maximum population density (people per km²)
 * @returns Array of municipalities within the density range
 */
export function getMunicipalitiesByPopulationDensity(
  minDensity: number = 0,
  maxDensity: number = Infinity
): Municipality[] {
  return municipalities.filter(m => {
    const density = m.population / m.area;
    return density >= minDensity && density <= maxDensity;
  });
}

/**
 * Get the largest municipalities by population.
 * @param count - Number of municipalities to return (default: 10)
 * @returns Array of largest municipalities by population
 */
export function getLargestMunicipalities(count: number = 10): Municipality[] {
  return getMunicipalitiesByPopulation(false).slice(0, count);
}

/**
 * Get the smallest municipalities by population.
 * @param count - Number of municipalities to return (default: 10)
 * @returns Array of smallest municipalities by population
 */
export function getSmallestMunicipalities(count: number = 10): Municipality[] {
  return getMunicipalitiesByPopulation(true).slice(0, count);
}

// ========================
// POSTAL CODE FUNCTIONS
// ========================

/**
 * Get all postal codes with metadata.
 * @returns Array of all postal codes
 */
export function getPostalCodes(): readonly PostalCode[] {
  return postalCodes;
}

/**
 * Get postal code information by postal code.
 * @param code - 4-digit postal code (e.g., "0001")
 * @returns PostalCode object or undefined if not found
 * @throws {TypeError} If code is not a string
 */
export function getPostalCodeByCode(code: string): PostalCode | undefined {
  if (typeof code !== 'string') {
    throw new TypeError('Postal code must be a string');
  }
  return postalCodes.find(pc => pc.code === code);
}

/**
 * Get postal codes by postal place (case-insensitive partial match by default).
 * @param place - Postal place name or partial name to search for
 * @param options - Search options
 * @returns Array of matching postal codes
 * @throws {TypeError} If place is not a string
 */
export function getPostalCodesByPlace(
  place: string,
  options: PostalCodeSearchOptions = {}
): PostalCode[] {
  if (typeof place !== 'string') {
    throw new TypeError('Postal place must be a string');
  }
  
  const {
    caseSensitive = false,
    exactMatch = false
  } = options;
  
  const searchTerm = caseSensitive ? place : place.toLowerCase();
  
  return postalCodes.filter(pc => {
    const placeName = caseSensitive 
      ? pc.place 
      : pc.place.toLowerCase();
    
    return exactMatch 
      ? placeName === searchTerm
      : placeName.includes(searchTerm);
  });
}

/**
 * Get postal codes by municipality ID.
 * @param municipalityId - 4-digit municipality ID (e.g., "0301" for Oslo)
 * @returns Array of postal codes for the municipality
 * @throws {TypeError} If municipalityId is not a string
 */
export function getPostalCodesByMunicipalityId(municipalityId: string): PostalCode[] {
  if (typeof municipalityId !== 'string') {
    throw new TypeError('Municipality ID must be a string');
  }
  return postalCodes.filter(pc => pc.id === municipalityId);
}

/**
 * Get unique postal places.
 * @returns Array of unique postal place names sorted alphabetically
 */
export function getUniquePostalPlaces(): readonly string[] {
  const uniquePlaces = new Set<string>();
  postalCodes.forEach(pc => uniquePlaces.add(pc.place));
  return Array.from(uniquePlaces).sort();
}

/**
 * Get postal codes within a range.
 * @param startCode - Starting postal code (inclusive)
 * @param endCode - Ending postal code (inclusive)
 * @returns Array of postal codes within the range
 * @throws {TypeError} If start or end codes are not strings
 */
export function getPostalCodesInRange(startCode: string, endCode: string): PostalCode[] {
  if (typeof startCode !== 'string' || typeof endCode !== 'string') {
    throw new TypeError('Start and end codes must be strings');
  }
  
  return postalCodes.filter(pc => 
    pc.code >= startCode && pc.code <= endCode
  );
}

/**
 * Get postal codes statistics.
 * @returns Object with total count and unique places count
 */
export function getPostalCodesStats(): {
  readonly totalPostalCodes: number;
  readonly uniquePlaces: number;
  readonly uniqueMunicipalities: number;
} {
  const uniquePlaces = new Set<string>();
  const uniqueMunicipalities = new Set<string>();
  
  postalCodes.forEach(pc => {
    uniquePlaces.add(pc.place);
    uniqueMunicipalities.add(pc.id);
  });
  
  return {
    totalPostalCodes: postalCodes.length,
    uniquePlaces: uniquePlaces.size,
    uniqueMunicipalities: uniqueMunicipalities.size
  };
}

/**
 * Get postal codes sorted by code.
 * @param ascending - Sort in ascending order if true (default: true)
 * @returns Array of postal codes sorted by postal code
 */
export function getPostalCodesSorted(ascending: boolean = true): PostalCode[] {
  const sorted = [...postalCodes].sort((a, b) => 
    ascending 
      ? a.code.localeCompare(b.code)
      : b.code.localeCompare(a.code)
  );
  return sorted;
}

/**
 * Check if a postal code exists.
 * @param code - 4-digit postal code to check
 * @returns True if postal code exists, false otherwise
 */
export function isValidPostalCode(code: string): boolean {
  if (typeof code !== 'string') {
    return false;
  }
  return postalCodes.some(pc => pc.code === code);
}

/**
 * Get postal codes by municipality name.
 * Note: This function combines data from municipalities and postal codes.
 * @param municipalityName - Municipality name to search for
 * @param exactMatch - Whether to match exactly (default: false)
 * @returns Array of postal codes for municipalities matching the name
 */
export function getPostalCodesByMunicipalityName(
  municipalityName: string,
  exactMatch: boolean = false
): PostalCode[] {
  const matchingMunicipalities = getMunicipalitiesByName(municipalityName, { exactMatch });
  const municipalityIds = matchingMunicipalities.map(m => m.id);
  
  return postalCodes.filter(pc => municipalityIds.includes(pc.id));
}

// Export types for external use
export type {
  Municipality,
  County,
  PostalCode,
  PopulationDensityStats,
  LanguageStatus,
  MunicipalitySearchOptions,
  MunicipalityFilterOptions,
  PostalCodeSearchOptions
};

