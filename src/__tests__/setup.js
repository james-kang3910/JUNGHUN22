import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// 각 테스트 후 자동 cleanup
afterEach(() => {
  cleanup();
});

// localStorage mock
const localStorageMock = {
  getItem: (key) => {
    return localStorageMock._data[key] || null;
  },
  setItem: (key, value) => {
    localStorageMock._data[key] = String(value);
  },
  removeItem: (key) => {
    delete localStorageMock._data[key];
  },
  clear: () => {
    localStorageMock._data = {};
  },
  _data: {}
};

global.localStorage = localStorageMock;

// fetch mock (기본)
global.fetch = async (url, options) => {
  throw new Error(`Unmocked fetch call to ${url}`);
};
