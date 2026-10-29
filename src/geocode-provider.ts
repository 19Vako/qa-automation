import type { GeocodeProvider, Coordinates } from './delivery-service';

export class HttpGeocodeProvider implements GeocodeProvider {
  constructor(private baseUrl: string) {}

  async getCoordinates(address: string): Promise<Coordinates> {
    const response = await fetch(`${this.baseUrl}/geocode?address=${encodeURIComponent(address)}`);
    
    if (!response.ok) throw new Error('GEOCODE_UNAVAILABLE');

    const data = await response.json();
    
    // Перевірка формату відповіді згідно з варіантом 10
    if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
      throw new Error('INVALID_FORMAT');
    }
    
    return { lat: data.lat, lng: data.lng };
  }
}