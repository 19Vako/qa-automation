import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeliveryAddressService } from '../src/delivery-service';
import type { GeocodeProvider, AuditLogger } from '../src/delivery-service';
import { InMemoryAddressRepository } from './fakes/in-memory-address-repository';

describe('DeliveryAddressService', () => {
  let geocoder: GeocodeProvider;
  let repo: InMemoryAddressRepository;
  let logger: AuditLogger;
  let service: DeliveryAddressService;

  beforeEach(() => {
    // Stub (заглушка) - імітуємо координати Києва
    geocoder = { getCoordinates: vi.fn().mockResolvedValue({ lat: 50.45, lng: 30.52 }) };
    // Fake (підробка) - використовуємо для перевірки стану
    repo = new InMemoryAddressRepository();
    // Spy (шпигун) - перевірка взаємодії
    logger = { logEvent: vi.fn() };
    
    service = new DeliveryAddressService(geocoder, repo, logger);
  });

  it('зберігає адресу, якщо вона знаходиться в межах України (Перевірка стану)', async () => {
    const coords = await service.registerAddress('Kyiv, Khreshchatyk');
    
    expect(coords).toEqual({ lat: 50.45, lng: 30.52 });
    
    // Перевірка стану (State verification): перевіряємо, чи змінився стан сховища
    const saved = await repo.findByAddress('Kyiv, Khreshchatyk');
    expect(saved).toEqual({ lat: 50.45, lng: 30.52 });
    expect(repo.size).toBe(1);
  });

  it('логує подію прийняття адреси (Перевірка взаємодії)', async () => {
    await service.registerAddress('Kyiv, Khreshchatyk');
    
    // Перевірка взаємодії (Interaction verification): логер не змінює стан, тому перевіряємо факт виклику
    expect(logger.logEvent).toHaveBeenCalledTimes(1);
    expect(logger.logEvent).toHaveBeenCalledWith('ACCEPTED', expect.stringContaining('Kyiv, Khreshchatyk'));
  });

  it('Сценарій відмови 1: відхиляє координати поза межами України (наприклад, Париж)', async () => {
    geocoder.getCoordinates = vi.fn().mockResolvedValue({ lat: 48.85, lng: 2.35 });

    // Обов'язковий await перед expect для асинхронних функцій
    await expect(service.registerAddress('Paris')).rejects.toThrow('OUT_OF_BOUNDS');
    
    // Перевіряємо, що у сховище нічого не збережено
    expect(repo.size).toBe(0);
    expect(logger.logEvent).toHaveBeenCalledWith('REJECTED', expect.stringContaining('Paris'));
  });

  it('Сценарій відмови 2: прокидає помилку, якщо провайдер геокодування недоступний', async () => {
    geocoder.getCoordinates = vi.fn().mockRejectedValue(new Error('API_DOWN'));

    await expect(service.registerAddress('Lviv')).rejects.toThrow('API_DOWN');
    expect(repo.size).toBe(0);
    // Логер не повинен викликатися, якщо впав провайдер
    expect(logger.logEvent).not.toHaveBeenCalled(); 
  });
});