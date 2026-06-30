module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: { '^.+\\.(js|jsx)$': 'babel-jest' },
  testMatch: ['**/__tests__/**/*.test.{js,jsx}'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  clearMocks: true,
};
