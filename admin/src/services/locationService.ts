/**
 * SnapAdda Location Intelligence Service
 * Standardizes geographic data retrieval across the platform.
 */

export interface PincodeData {
  village: string;
  mandal: string;
  district: string;
  state: string;
  allVillages: string[];
}

class LocationService {
  private cache: Map<string, PincodeData> = new Map();

  async fetchByPincode(code: string): Promise<PincodeData | null> {
    if (code.length !== 6) return null;
    if (this.cache.has(code)) return this.cache.get(code)!;

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await response.json();

      if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
        const offices = data[0].PostOffice;
        const main = offices[0];
        
        const result: PincodeData = {
          village: offices.length === 1 ? main.Name : '',
          mandal: main.Block !== 'NA' ? main.Block : main.Name,
          district: main.District,
          state: main.State,
          allVillages: offices.map((o: any) => o.Name)
        };

        this.cache.set(code, result);
        return result;
      }
    } catch (err) {
      console.error("LocationService: Pincode API failed", err);
    }
    return null;
  }
}

export const locationService = new LocationService();
