/** @type {import('ts-jest').JestConfigWithTsJest} */
const config =  {
  preset: 'ts-jest',
  roots: [
      "<rootDir>/__tests__",
      "<rootDir>/src"
  ],

};

module.exports = config;