module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['<rootDir>/lib/**/__tests__/*.test.+(ts|tsx|js)'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.test.json',
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
