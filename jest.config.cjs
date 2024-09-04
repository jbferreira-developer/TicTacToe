module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    globals: {
        'ts-jest': {
            tsconfig: 'test/tsconfig.test.json',
        },
    },
    moduleNameMapper: {
        "^@client/(.*)$": "<rootDir>/client/$1"
    },
};
