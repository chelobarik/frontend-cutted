module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/typescript', // default typescript related rules
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  "ignorePatterns": ["tests/", "node_modules/"],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/interface-name-prefix': ['warn', {  prefixWithI: 'always'  }],
    // "@typescript-eslint/naming-convention": [
    //   "error",
    //   {
    //     "selector": "interface",
    //     "format": ["PascalCase"],
    //     "custom": {
    //       "regex": "^I[A-Z]",
    //       "match": true
    //     }
    //   }
    // ],
    '@typescript-eslint/no-unused-vars': "error",
    '@typescript-eslint/member-delimiter-style': ['error',
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    '@typescript-eslint/explicit-module-boundary-types': "off",
  }

}


