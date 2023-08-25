module.exports = {
    testEnvironment: 'node',
    roots: [ '<rootDir>/tests'],
    transform: {
      '^.+\\.js$': 'babel-jest'
    }
  };