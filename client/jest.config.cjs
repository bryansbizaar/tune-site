// module.exports = {
//   testEnvironment: "jsdom",
//   setupFiles: ["<rootDir>/jest.setup.js"],
//   setupFilesAfterEnv: ["@testing-library/jest-dom"],
//   moduleNameMapper: {
//     "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
//       "<rootDir>/__mocks__/fileMock.js",
//     "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
//   },
//   transform: {
//     "^.+\\.(js|jsx)$": "babel-jest",
//   },
//   transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
//   moduleDirectories: ["node_modules", "src"],
//   testMatch: ["<rootDir>/src/**/*.test.js", "<rootDir>/__tests__/**/*.test.js"],
//   globals: {
//     NODE_ENV: "test",
//   },
//   collectCoverage: true,
//   coverageDirectory: "coverage",
//   coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
// };

// module.exports = {
//   testEnvironment: "jsdom",
//   setupFiles: ["<rootDir>/jest.setup.js"],
//   setupFilesAfterEnv: ["@testing-library/jest-dom"],
//   moduleNameMapper: {
//     "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
//       "<rootDir>/__mocks__/fileMock.js",
//     "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
//   },
//   transform: {
//     "^.+\\.(js|jsx)$": "babel-jest",
//   },
//   transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
//   moduleDirectories: ["node_modules", "src"],
//   testMatch: ["<rootDir>/src/**/*.test.js", "<rootDir>/__tests__/**/*.test.js"],
//   globals: {
//     NODE_ENV: "test",
//   },
//   collectCoverage: true,
//   coverageDirectory: "coverage",
//   coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
// };

module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
  moduleDirectories: ["node_modules", "src"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx}",
    "<rootDir>/__tests__/**/*.{js,jsx}",
  ],
  globals: {
    NODE_ENV: "test",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
  rootDir: "./",
};
