module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/*.test.js"],
  moduleDirectories: ["node_modules", "src"],
  verbose: true,
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
};
