import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../dev.env') });
import express from 'express'
import { initializeDatabase } from './db/dbinit';
import chargingStationTypeRouter from './router/chargingstationtype';
import chargingStationRouter from './router/chargingstation';
import connectorRouter from './router/connector';
import logger from './utils/logger';

const app = express()
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

initializeDatabase();

app.use(express.json());
app.use(chargingStationTypeRouter);
app.use(chargingStationRouter);
app.use(connectorRouter);

app.listen(port, () => {
    logger.info(`Server is running at port ${port}`);
});