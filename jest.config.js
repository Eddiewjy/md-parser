export default {
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.(js|jsx|ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
