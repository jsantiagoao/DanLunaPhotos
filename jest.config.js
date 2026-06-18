module.exports = {
  transform: {
    '^.+\\.(ts|mjs)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: false,
    }],
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  transformIgnorePatterns: ['node_modules/(?!@angular)'],
  moduleFileExtensions: ['ts', 'mjs', 'js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1',
  },
};
