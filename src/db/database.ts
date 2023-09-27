import { Sequelize } from 'sequelize';
import { initialize as initializeCSType, ChargingStationType } from '../models/chargingStationType.model';
import { initialize as initializeCS, ChargingStation } from '../models/chargingStation.model';
import { initialize as initializeConnector, Connector } from '../models/connector.model';

const sequelize = new Sequelize({
  dialect: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
});

initializeCSType(sequelize);
initializeCS(sequelize);
initializeConnector(sequelize);

export { sequelize, ChargingStationType, ChargingStation, Connector };
