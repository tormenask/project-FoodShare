module.exports = {
    env: {
        node: true,
        jest: true
    },
    
    extends: ['eslint:recommended', 'plugin:node/recommended', 'prettier'],
    parserOptions: {
        ecmaVersion: 2020, 
        sourceType: 'module',
    },
    rules: {
        'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
        'node/no-missing-require': 'off', 
        'node/no-extraneous-require': 'off',
        'no-console': 'warn', 
    },
    overrides: [
        {
            files: ['src/index.js', 'src/models/sequelize.js'],
            rules: {
                'node/no-unpublished-require': 'off'
            }
        }
    ]
};