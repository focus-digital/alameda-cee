import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure React Testing Library unmounts between tests
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
