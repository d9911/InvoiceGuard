module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }]
  },
  // This is crucial for uuid and other ESM-only/hybrid packages
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"
  ],
  verbose: true,
  testTimeout: 30000
};
