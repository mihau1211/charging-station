import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Charging Station API',
            version: '1.0.0',
            description: 'API for managing Charging Station',
        },
    },
    apis: [path.resolve(__dirname, '../router/*')],
};

const specs = swaggerJsdoc(options);
export default specs;
