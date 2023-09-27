import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../test.env') });
import { initializeDatabase, sequelize } from '../src/db/dbinit';
import { ChargingStationType } from '../src/models/chargingStationType.model';
import logger from '../src/utils/logger';

describe('Database Initialization', () => {  
  beforeAll(async () => {
    await sequelize.sync({force: true});
  });

  it('should initialize database and create records if tables do not exist', async () => {
    const logMock = jest.spyOn(logger, 'info').mockImplementation();
    const errorMock = jest.spyOn(logger, 'error').mockImplementation();
    
    await initializeDatabase();

    const count = await ChargingStationType.count();
    expect(count).toBe(5);

    expect(logMock).toHaveBeenCalledWith('Database and tables created!');
    expect(logMock).toHaveBeenCalledWith('Default records created!');
    expect(errorMock).not.toHaveBeenCalled();

    logMock.mockRestore();
    errorMock.mockRestore();
  });

  it('should not initialize database and create records if tables exist', async () => {
    const logMock = jest.spyOn(logger, 'info').mockImplementation();
    const errorMock = jest.spyOn(logger, 'error').mockImplementation();
    
    await initializeDatabase();

    const count = await ChargingStationType.count();
    expect(count).toBe(5);

    expect(logMock).toHaveBeenCalledWith('Database tables already exist. Skipping initialization.');
    expect(errorMock).not.toHaveBeenCalled();

    logMock.mockRestore();
    errorMock.mockRestore();
  });

});
