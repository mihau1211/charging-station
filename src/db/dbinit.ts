import { Sequelize } from 'sequelize';
import { ChargingStationType, initialize as initializeCSType } from '../models/chargingStationType.model';
import { ChargingStation, initialize as initializeCS } from '../models/chargingStation.model';
import { Connector, initialize as initializeConnector } from '../models/connector.model';
import logger from '../utils/logger';

const sequelize = new Sequelize(
    process.env.DB_DATABASE as string,
    process.env.DB_USERNAME as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: Number(process.env.DB_PORT)
    }
);

initializeCSType(sequelize);
initializeCS(sequelize);
initializeConnector(sequelize);

async function initializeDatabase() {
    try {
        const chargingStationTypesExist = await ChargingStationType.count();
        console.log(chargingStationTypesExist !== 0);

        if (chargingStationTypesExist === 0) {

            await sequelize.sync({ force: false });
            logger.info('Database and tables created!');

            const defaultChargingStationTypes = [
                { name: 'Type 1', plug_count: 2, efficiency: 0.9, current_type: 'AC' },
                { name: 'Type 2', plug_count: 4, efficiency: 0.8, current_type: 'DC' },
                { name: 'Type 3', plug_count: 3, efficiency: 0.7, current_type: 'AC' },
                { name: 'Type 4', plug_count: 4, efficiency: 0.6, current_type: 'DC' },
                { name: 'Type 5', plug_count: 5, efficiency: 0.88, current_type: 'AC' }
            ];

            for (const type of defaultChargingStationTypes) {
                await ChargingStationType.findOrCreate({ where: { name: type.name }, defaults: type });
            }

            logger.info('Default records created!');
        } else {
            logger.info('Database tables already exist. Skipping initialization.');
        }
    } catch (err) {
        logger.error('Unable to create Database and tables:', err);
    }
}

export { initializeDatabase, sequelize };
