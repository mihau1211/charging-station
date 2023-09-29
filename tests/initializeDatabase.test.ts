import { initializeDatabase, sequelize } from '../src/db/dbinit';
import { ChargingStationType } from '../src/models/chargingStationType.model';
import logger from '../src/utils/logger';

jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe('Database Initialization', () => {
  beforeAll(async () => {
    process.env.DB_DATABASE = ':memory:';
    process.env.DB_DIALECT = 'sqlite';
    
    await initializeDatabase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  afterAll(async () => {
    await sequelize.close();
  });

  test('should initialize ChargingStationType table correctly', async () => {
    const count = await ChargingStationType.count();
    expect(count).toBe(5);
    expect(logger.info).toHaveBeenCalledWith('Database and tables created!');
    expect(logger.info).toHaveBeenCalledWith('Default records created!');
  });

  test('should not initialize ChargingStationType table and log info regarding skipping initialization', async () => {
    await initializeDatabase();
    const count = await ChargingStationType.count();
    expect(count).toBe(5);
    expect(logger.info).not.toHaveBeenCalledWith('Database and tables created!');
    expect(logger.info).not.toHaveBeenCalledWith('Default records created!');
    expect(logger.info).toHaveBeenCalledWith('Database tables already exist. Skipping initialization.');
  });
});
