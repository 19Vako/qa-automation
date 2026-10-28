import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // Захист від реальних мережевих запитів
afterEach(() => server.resetHandlers());
afterAll(() => server.close());