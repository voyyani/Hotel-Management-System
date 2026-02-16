/**
 * Test Setup Configuration
 * Configures the testing environment with necessary polyfills and mocks
 */

import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { mockIntersectionObserver, mockMatchMedia, mockLocalStorage } from './utils/test-helpers';

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock browser APIs
mockMatchMedia();
mockIntersectionObserver();

// Mock localStorage
global.localStorage = mockLocalStorage() as Storage;

// Mock window.scrollTo
global.scrollTo = vi.fn() as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
