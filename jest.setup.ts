import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

// Next.js components/hooks simple mocks
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
      replace: () => null,
    };
  }
}));

// Mock window.navigator.vibrate
Object.defineProperty(window.navigator, 'vibrate', {
  value: jest.fn(),
  configurable: true,
});
