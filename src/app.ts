import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger';
import { initializeDatabase } from './db/dbinit';
import chargingStationTypeRouter from './router/chargingstationtype';
import chargingStationRouter from './router/chargingstation';
import connectorRouter from './router/connector';
import tokenRouter from './router/token';

const app = express();

initializeDatabase();

app.use(express.json());
app.use('/api/v1', chargingStationTypeRouter);
app.use('/api/v1', chargingStationRouter);
app.use('/api/v1', connectorRouter);
app.use('/api/v1', tokenRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
