export interface APDistrict {
  district: string;
  hq: string;
  mandals: string[];
}

export declare const AP_DISTRICTS: APDistrict[];
export declare const ALL_AP_LOCATIONS: string[];
export declare const AP_DISTRICT_NAMES: string[];
export declare function getMandalsForDistrict(districtName: string): string[];
export declare function searchLocations(query?: string, limit?: number): string[];
