// Jest setup file (jest.setup.js)

// Mock TypeORM AppDataSource
jest.mock('./src/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      // Add other repository methods if needed by controllers
    }),
    // Mock other AppDataSource properties/methods if necessary
  },
}));

// Mock pdfService
jest.mock('./src/services/pdfService', () => ({
  generateSklPdfDefinition: jest.fn(),
  createPdfBlob: jest.fn(),
}));

// Mock fs for pdfService font checks (if they cause issues during tests)
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Import and retain default behavior
  existsSync: jest.fn().mockReturnValue(true), // Assume all fonts exist for tests
  readFileSync: jest.fn().mockReturnValue(Buffer.from('')), // Mock file reading if needed
}));

// Mock path for pdfService font path resolution (if they cause issues)
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  resolve: jest.fn((...args) => args.join('/')), // Simple mock for path.resolve
}));
