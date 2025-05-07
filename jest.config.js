export default {
    testEnvironment: 'node',

    transform: {
        '^.+\\.js$': 'babel-jest',
      },
      moduleFileExtensions: ['js', 'json', 'node'],

    moduleNameMapper: {
      '^\\./authentication/auth.js$': '<rootDir>/__mocks__/auth.js',
      '^multer$': '<rootDir>/__mocks__/multer.js',
      '^\\./controllers/subject.controllers.js$': '<rootDir>/__mocks__/subject.controllers.js',
        '^\\./config/nodemailer.js$': '<rootDir>/__mocks__/nodemailer.js',
        '^\\./config/globalErrors.js$': '<rootDir>/__mocks__/globalErrors.js',
        '^\\./config/logger.js$': '<rootDir>/__mocks__/logger.js',
        '^\\./config/db.js$': '<rootDir>/__mocks__/db.js',
        '^\\./config/swagger.js$': '<rootDir>/__mocks__/swagger.js',
    },
  };
  