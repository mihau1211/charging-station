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
app.use(chargingStationTypeRouter);
app.use(chargingStationRouter);
app.use(connectorRouter);
app.use(tokenRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
