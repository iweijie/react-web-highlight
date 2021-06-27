// jest.config.js
const { defaults } = require('jest-config');

module.exports = {
  roots: [
    './test', // 测试目录
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.less?$': '<rootDir>/ignoreJestStyle.js',
  },

  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverage: true, // 统计覆盖率
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  testEnvironment: 'jsdom',
};
