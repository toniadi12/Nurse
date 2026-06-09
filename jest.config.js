// Jest config untuk Jaga.
//
// Pakai `jest-expo` preset — menangani babel transform untuk RN + Expo
// + setup mock untuk native modules. Tanpa ini, import Reanimated /
// AsyncStorage / dll di test akan error.
//
// `transformIgnorePatterns` perlu listing package yang harus di-transpile
// (default jest skip node_modules). Pattern di bawah cover Expo + RN +
// library kita yg ESM-only.

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|react-native-worklets|lucide-react-native)',
  ],
  // Co-located test files: <name>.test.ts atau <name>.test.tsx
  // di sebelah source file (sesuai CLAUDE.md naming convention).
  testMatch: ['**/?(*.)+(test).ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/android/', '/ios/'],
  // Path alias @/* sama persis tsconfig.json — supaya import di test
  // identik dgn import di source.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
