export default () => ({
    single: jest.fn().mockImplementation(() => (req, res, next) => next()), 
    array: jest.fn().mockImplementation(() => (req, res, next) => next()),
  });
  