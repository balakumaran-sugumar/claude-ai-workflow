import '@testing-library/jest-dom';

// Simple sessionStorage mock backed by a plain object
const sessionStorageStore: Record<string, string> = {};

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: (key: string) => sessionStorageStore[key] ?? null,
    setItem: (key: string, value: string) => { sessionStorageStore[key] = value; },
    removeItem: (key: string) => { delete sessionStorageStore[key]; },
    clear: () => { Object.keys(sessionStorageStore).forEach((k) => delete sessionStorageStore[k]); },
    get length() { return Object.keys(sessionStorageStore).length; },
    key: (index: number) => Object.keys(sessionStorageStore)[index] ?? null,
  },
  writable: false,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for download tests
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();
