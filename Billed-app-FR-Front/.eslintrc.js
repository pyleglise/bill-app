module.exports = {
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'standard'
  ],
  globals: {
    window: true,
    browser: true,
    node: true,
    document: true
  },
  env: {
    browser: true,
    node: true
  }
}
