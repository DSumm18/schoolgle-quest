module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@schoolgle/shared$': '<rootDir>/../../packages/shared/src',
    '^@schoolgle/game-logic$': '<rootDir>/../../packages/game-logic/src',
    '^@schoolgle/integration$': '<rootDir>/../../packages/integration/src',
  },
  passWithNoTests: true,
};
