module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['<rootDir>/lib/**/__tests__/*.test.+(ts|tsx|js)'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
