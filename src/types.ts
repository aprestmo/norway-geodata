/**
 * Language status for Norwegian municipalities
 */
export type LanguageStatus = 'Nøytral' | 'Bokmål' | 'Nynorsk';

/**
 * Municipality (Kommune) data structure
 */
export interface Municipality {
  /** 4-digit municipality ID */
  readonly id: string;
  /** Municipality name */
  readonly name: string;
  /** Municipality name in Norwegian */
  readonly name_no: string;
  /** Administrative center */
  readonly adm_center: string;
  /** Population count */
  readonly population: number;
  /** Area in square kilometers */
  readonly area: number;
  /** Official language status */
  readonly language: LanguageStatus;
  /** Official website URL */
  readonly url: string;
  /** Array of postal codes with place names */
  readonly postal_codes: readonly {
    /** 4-digit postal code */
    readonly code: string;
    /** Place name */
    readonly place: string;
  }[];
}
/**
 * County (Fylke) data structure
 */
export interface County {
  /** 2-digit county ID */
  readonly id: string;
  /** County name */
  readonly name: string;
  /** Official website URL */
  readonly url: string;
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

/**
 * Postal Code data structure
 */
export interface PostalCode {
  /** 4-digit postal code */
  readonly code: string;
  /** Postal place name */
  readonly place: string;
  /** 4-digit municipality ID */
  readonly id: string;
}

/**
 * Search options for postal codes
 */
export interface PostalCodeSearchOptions {
  /** Case sensitive search */
  readonly caseSensitive?: boolean;
  /** Exact match only */
  readonly exactMatch?: boolean;
}
