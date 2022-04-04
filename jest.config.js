module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.(test|spec).([jt]s?(x)|[mc]js)'],
  collectCoverageFrom: ['!**/src/__tests__/**/*', '**/src/components/**/*'],
  moduleDirectories: ['node_modules', 'src'],
};
