/**
 * Language status for Norwegian municipalities
 */
export type LanguageStatus = 'Nøytral' | 'Bokmål' | 'Nynorsk' | 'Sami' | 'Kvensk';

/**
 * Municipality (Kommune) data structure
 */
export interface Municipality {
  /** 4-digit municipality ID */
  readonly k_id: string;
  /** Municipality name */
  readonly k_name: string;
  /** Municipality name in Norwegian */
  readonly k_name_no: string;
  /** Administrative center */
  readonly k_adm_center: string;
  /** Population count */
  readonly k_population: number;
  /** Area in square kilometers */
  readonly k_area: number;
  /** Official language status */
  readonly k_language: LanguageStatus;
  /** Official website URL */
  readonly k_url: string;
  /** Array of postal codes */
  readonly k_postal_codes: readonly number[];
}

/**
 * County (Fylke) data structure
 */
export interface County {
  /** 2-digit county ID */
  readonly f_id: string;
  /** County name */
  readonly f_name: string;
  /** Official website URL */
  readonly f_url: string;
}

/**
 * Population density statistics
 */
export interface PopulationDensityStats {
  /** Minimum population density (people per km²) */
  readonly min: number;
  /** Maximum population density (people per km²) */
  readonly max: number;
  /** Average population density (people per km²) */
  readonly average: number;
}

/**
 * Version bump types for semantic versioning
 */
export type VersionBumpType = 'patch' | 'minor' | 'major' | 'prerelease';

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Search options for municipalities
 */
export interface MunicipalitySearchOptions {
  /** Search in both Norwegian and English names */
  readonly includeAllNames?: boolean;
  /** Case sensitive search */
  readonly caseSensitive?: boolean;
  /** Exact match only */
  readonly exactMatch?: boolean;
}

/**
 * Filter options for municipalities
 */
export interface MunicipalityFilterOptions {
  /** Minimum population */
  readonly minPopulation?: number;
  /** Maximum population */
  readonly maxPopulation?: number;
  /** Minimum area (km²) */
  readonly minArea?: number;
  /** Maximum area (km²) */
  readonly maxArea?: number;
  /** Language status */
  readonly language?: LanguageStatus;
  /** County ID */
  readonly countyId?: string;
}

