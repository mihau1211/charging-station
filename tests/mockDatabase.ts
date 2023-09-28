import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');

const findOrCreate = jest.fn();

const ChargingStationType = {
  findOrCreate,
};

export { sequelize, ChargingStationType };
