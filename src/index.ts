import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../dev.env') });
import express from 'express'
import { initializeDatabase } from './db/dbinit';
import CSTypeRouter from './router/chargingstationtype';
import CSRouter from './router/chargingstation';
import logger from './utils/logger';

const app = express()
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

initializeDatabase();

app.use(express.json());
app.use(CSTypeRouter);
app.use(CSRouter);

app.listen(port, () => {
    logger.info(`Server is running at port ${port}`);
});