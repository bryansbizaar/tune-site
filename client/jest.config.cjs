// module.exports = {
//   testEnvironment: "jsdom",
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
// };
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js", // This part is correct
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
  moduleDirectories: ["node_modules", "src"],
};