import type { Config } from 'jest';

const config: Config = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'html', 'js', 'json'],
    transform: {
        '^.+\\.(ts|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.html$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
    moduleNameMapper: {
        '^leaflet$': '<rootDir>/src/__mocks__/leaflet.ts',
    },
    collectCoverageFrom: [
        'src/app/**/*.ts',
        '!src/app/**/*.spec.ts',
        '!src/app/**/index.ts',
    ],
    coverageDirectory: '<rootDir>/coverage',
};

export default config;
