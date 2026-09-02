/**
 * `jest-preset-angular` estaba instalado pero sin usar: la configuracion solo tenia
 * ts-jest, asi que cualquier spec que importara un componente Angular fallaba con
 * "needs to be compiled using the JIT compiler". Por eso hasta ahora solo corrian
 * las pruebas de logica pura.
 */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    }],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'mjs', 'json'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1',
  },
};
