import type { AddressRepository, Coordinates } from '../../src/delivery-service';

export class InMemoryAddressRepository implements AddressRepository {
  private store = new Map<string, Coordinates>();

  async save(address: string, coords: Coordinates): Promise<void> {
    this.store.set(address, coords);
  }

  async findByAddress(address: string): Promise<Coordinates | undefined> {
    return this.store.get(address);
  }

  get size(): number {
    return this.store.size;
  }
}