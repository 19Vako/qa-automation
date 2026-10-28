import { describe, it, expect, vi } from 'vitest';
import type { GeocodeProvider, AuditLogger, AddressRepository } from '../src/delivery-service';
import { InMemoryAddressRepository } from './fakes/in-memory-address-repository';

// 1. Исходная реализация (сохраняет 1 вызовом)
class SingleSaveService {
  constructor(
    private geocoder: GeocodeProvider,
    private repo: AddressRepository,
    private logger: AuditLogger
  ) {}

  async registerAddress(address: string) {
    const coords = await this.geocoder.getCoordinates(address);
    await this.repo.save(address, coords);
    return coords;
  }
}

// 2.  (сохраняет 2 вызовами)
class DoubleSaveService {
  constructor(
    private geocoder: GeocodeProvider,
    private repo: AddressRepository,
    private logger: AuditLogger
  ) {}

  async registerAddress(address: string) {
    const coords = await this.geocoder.getCoordinates(address);
    await this.repo.save(`${address}_draft`, { lat: 0, lng: 0 }); // Черновик
    await this.repo.save(address, coords); // Итоговая запись
    return coords;
  }
}

describe('Крок 9. Експеримент: Стан проти Взаємодії', () => {
  const mockGeocoder: GeocodeProvider = {
    getCoordinates: vi.fn().mockResolvedValue({ lat: 50.45, lng: 30.52 }),
  };
  const mockLogger: AuditLogger = { logEvent: vi.fn() };

  it('До рефакторинга (SingleSaveService): оба подхода работают', async () => {
    const spyRepo: AddressRepository = { save: vi.fn(), findByAddress: vi.fn() };
    const fakeRepo = new InMemoryAddressRepository();

    const service1 = new SingleSaveService(mockGeocoder, spyRepo, mockLogger);
    await service1.registerAddress('Kyiv');
    expect(spyRepo.save).toHaveBeenCalledTimes(1);

    const service2 = new SingleSaveService(mockGeocoder, fakeRepo, mockLogger);
    await service2.registerAddress('Kyiv');
    expect(await fakeRepo.findByAddress('Kyiv')).toEqual({ lat: 50.45, lng: 30.52 });
  });

  it('После рефакторинга (DoubleSaveService): шпион падает, подделка проходит', async () => {
    const spyRepo: AddressRepository = { save: vi.fn(), findByAddress: vi.fn() };
    const fakeRepo = new InMemoryAddressRepository();

    const serviceWithSpy = new DoubleSaveService(mockGeocoder, spyRepo, mockLogger);
    await serviceWithSpy.registerAddress('Kyiv');
    // Ожидали 1 вызов, а было 2 -> Этот тест ПАДАЕТ!
    // expect(spyRepo.save).toHaveBeenCalledTimes(1); 

    const serviceWithFake = new DoubleSaveService(mockGeocoder, fakeRepo, mockLogger);
    await serviceWithFake.registerAddress('Kyiv');
    // Проверяем конечное состояние -> Этот тест ПРОХОДИТ!
    expect(await fakeRepo.findByAddress('Kyiv')).toEqual({ lat: 50.45, lng: 30.52 });
  });
});