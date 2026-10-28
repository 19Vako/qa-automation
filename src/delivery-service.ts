export interface Coordinates {
  lat: number;
  lng: number;
}

// Залежність 1: HTTP-провайдер геокодування
export interface GeocodeProvider {
  getCoordinates(address: string): Promise<Coordinates>;
}

// Залежність 2: Сховище для підтверджених адрес
export interface AddressRepository {
  save(address: string, coords: Coordinates): Promise<void>;
  findByAddress(address: string): Promise<Coordinates | undefined>;
}

// Залежність 3: Система аудиту/логування
export interface AuditLogger {
  logEvent(event: string, details: string): void;
}

export class DeliveryAddressService {
  constructor(
    private geocoder: GeocodeProvider,
    private repo: AddressRepository,
    private logger: AuditLogger
  ) {}

  async registerAddress(address: string): Promise<Coordinates> {
    const coords = await this.geocoder.getCoordinates(address);

    if (!this.isWithinUkraine(coords)) {
      this.logger.logEvent('REJECTED', `Address ${address} is outside Ukraine`);
      throw new Error('OUT_OF_BOUNDS');
    }

    await this.repo.save(address, coords);
    this.logger.logEvent('ACCEPTED', `Address ${address} registered`);
    
    return coords;
  }

  // Приблизні географічні координати крайніх точок України
  private isWithinUkraine(coords: Coordinates): boolean {
    return coords.lat >= 44.3 && coords.lat <= 52.3 && coords.lng >= 22.1 && coords.lng <= 40.2;
  }
}