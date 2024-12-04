/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  // This option allows the use of a custom results processor
  testResultsProcessor: 'jest-sonar-reporter',
  transformIgnorePatterns: ['node_modules/(?!@seebo)'],
};
