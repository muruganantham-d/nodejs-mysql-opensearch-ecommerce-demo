// HEADER: Jest config for backend tests with Node runtime.
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};

/*
BOTTOM EXPLANATION
- Responsibility: Configures Jest behavior for backend API/service tests.
- Key syntax: `setupFilesAfterEnv` runs setup code before each test file.
- Common mistakes: Missing node testEnvironment causes browser-like globals mismatch.
*/
