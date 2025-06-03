import municipalitiesData from '../data/kommuner-2025.json';
import countiesData from '../data/fylker-2025.json';
import packageJson from '../package.json';
import type {
  Municipality,
  County,
  PopulationDensityStats,
  LanguageStatus,
  MunicipalitySearchOptions,
  MunicipalityFilterOptions
} from './types';

// Type-safe data imports
const municipalities: readonly Municipality[] = municipalitiesData as Municipality[];
const counties: readonly County[] = countiesData as County[];

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
  return municipalities.find(m => m.k_id === id);
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
      ? [m.k_name, m.k_name_no]
      : [m.k_name];
    
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
  return counties.find(f => f.f_id === id);
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
    const countyName = f.f_name.toLowerCase();
    return exactMatch ? countyName === searchTerm : countyName.includes(searchTerm);
  });
}

/**
 * Get all municipalities in a given county.
 * @param countyId - 2-digit county ID (first two digits of municipality k_id)
 * @returns Array of municipalities in the county
 * @throws {TypeError} If countyId is not a string
 */
export function getMunicipalitiesByCounty(countyId: string): Municipality[] {
  if (typeof countyId !== 'string') {
    throw new TypeError('County ID must be a string');
  }
  return municipalities.filter(m => m.k_id.startsWith(countyId));
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
  return municipalities.find(m => m.k_postal_codes.some(pc => pc.zip === code));
}

/**
 * Get all postal codes for a specific municipality.
 * @param municipalityId - 4-digit municipality ID
 * @returns Array of postal codes or undefined if municipality not found
 */
export function getPostalCodesByMunicipality(municipalityId: string): readonly string[] | undefined {
  const municipality = getMunicipalityById(municipalityId);
  return municipality ? municipality.k_postal_codes.map(pc => pc.zip) : undefined;
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
      municipality.k_postal_codes.forEach(pc => {
        allPostalCodes.push({
          zip: pc.zip,
          place: pc.place,
          municipalityId: municipality.k_id,
          municipalityName: municipality.k_name
        });
      });
    });
    return allPostalCodes.sort((a, b) => a.zip.localeCompare(b.zip));
  } else {
    const allPostalCodes = new Set<string>();
    municipalities.forEach(municipality => {
      municipality.k_postal_codes.forEach(pc => {
        allPostalCodes.add(pc.zip);
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
    ascending ? a.k_population - b.k_population : b.k_population - a.k_population
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
    ascending ? a.k_area - b.k_area : b.k_area - a.k_area
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
  return municipalities.filter(m => m.k_language === language);
}

/**
 * Get municipalities with advanced filtering options.
 * @param options - Filter options
 * @returns Array of municipalities matching the filter criteria
 */
export function getMunicipalitiesFiltered(options: MunicipalityFilterOptions): Municipality[] {
  return municipalities.filter(m => {
    if (options.minPopulation !== undefined && m.k_population < options.minPopulation) return false;
    if (options.maxPopulation !== undefined && m.k_population > options.maxPopulation) return false;
    if (options.minArea !== undefined && m.k_area < options.minArea) return false;
    if (options.maxArea !== undefined && m.k_area > options.maxArea) return false;
    if (options.language !== undefined && m.k_language !== options.language) return false;
    if (options.countyId !== undefined && !m.k_id.startsWith(options.countyId)) return false;
    return true;
  });
}

/**
 * Get total population of all municipalities.
 * @returns Total population
 */
export function getTotalPopulation(): number {
  return municipalities.reduce((total, m) => total + m.k_population, 0);
}

/**
 * Get total area of all municipalities.
 * @returns Total area in square kilometers
 */
export function getTotalArea(): number {
  return municipalities.reduce((total, m) => total + m.k_area, 0);
}

/**
 * Get population density statistics.
 * @returns Object with min, max, and average population density
 */
export function getPopulationDensityStats(): PopulationDensityStats {
  const densities = municipalities.map(m => m.k_population / m.k_area);
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
    const density = m.k_population / m.k_area;
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

// Export types for external use
export type {
  Municipality,
  County,
  PopulationDensityStats,
  LanguageStatus,
  MunicipalitySearchOptions,
  MunicipalityFilterOptions
};

