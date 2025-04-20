module.exports = {
    root: true,
    env: {
        node: true,
        es2020: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    ignorePatterns: ['dist/', 'bin/', 'templates/', '*.js'],
    rules: {
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-console': 'off',
    },
};
