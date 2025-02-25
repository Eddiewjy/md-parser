//目前仅配置，未实际撰写测试用例
export default {
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.(js|jsx|ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
