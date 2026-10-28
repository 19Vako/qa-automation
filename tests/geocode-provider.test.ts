import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './msw/server';
import { HttpGeocodeProvider } from '../src/geocode-provider';

const GEOCODE_URL = 'https://api.geo.com/geocode';
const provider = new HttpGeocodeProvider('https://api.geo.com');

describe('HttpGeocodeProvider (MSW)', () => {
  
  it('Сценарій 1 (Успіх): повертає координати при коректній відповіді', async () => {
    server.use(
      http.get(GEOCODE_URL, () => HttpResponse.json({ lat: 49.83, lng: 24.02 }))
    );
    await expect(provider.getCoordinates('Lviv')).resolves.toEqual({ lat: 49.83, lng: 24.02 });
  });

  it('Сценарій 2 (Помилковий статус): відхиляє відповідь зі статусом 500', async () => {
    server.use(
      http.get(GEOCODE_URL, () => new HttpResponse(null, { status: 500 }))
    );
    await expect(provider.getCoordinates('Lviv')).rejects.toThrow('GEOCODE_UNAVAILABLE');
  });

  it('Сценарій 3 (Некоректний формат): відхиляє координати у вигляді рядків', async () => {
    server.use(
      http.get(GEOCODE_URL, () => HttpResponse.json({ lat: "49.83", lng: "24.02" }))
    );
    await expect(provider.getCoordinates('Lviv')).rejects.toThrow('INVALID_FORMAT');
  });
});