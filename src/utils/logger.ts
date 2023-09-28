import winston from 'winston';

class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)
            ),
            transports: [
                new winston.transports.Console()
            ],
        });
    }

    info(message: string) {
        this.logger.info(message);
    }

    error(message: string) {
        this.logger.error(message);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    beginLogger(method: string, endpoint: string, body?: any) {
        this.logger.info(`${method} request received at ${endpoint} ${!body ? '' : `with body: ${JSON.stringify(body)}`}`);
    }

    postSuccessLogger(model: string) {
        this.logger.info(`${model} successfully created.`);
    }

    postErrorLogger(model: string, errorMessage: string) {
        this.logger.error(`Error occurred while creating ${model}: ${errorMessage}`);
    }

    getSuccessLogger(model: string, where: any, limit: number | undefined, offset: number | undefined) {
        this.logger.info(`Fetching ${model} with conditions: ${JSON.stringify(where)} ${limit ? `, limit: ${limit}` : ''}${offset ? `, offset: ${offset}` : ''}`);
    }

    getErrorLogger(model: string, errorMessage: string) {
        this.logger.error(`Error occurred while fetching ${model}: ${errorMessage}`);
    }

    idNotFoundLogger(model: string, id: string) {
        this.logger.error(`${model} not found for ID: ${id}`);
    }

    invalidFieldsErrorLogger(endpoint: string) {
        this.logger.error(`Invalid fields in request to ${endpoint}`);
    }

    patchSuccessLogger(model: string, id: string) {
        this.logger.info(`${model} with id: ${id} successfully updated`);
    }

    constraintViolationErrorLogger(model: string, id: string, errorMessage: string) {
        this.logger.error(`Unique constraint violation updating ${model} with id: ${id} - ${errorMessage}`);
    }
    
    patchInternalErrorLogger(model: string, id: string, errorMessage: string) {
        this.logger.error(`Internal Server Error updating ${model} with id: ${id} - ${errorMessage}`);
    }
}

const logger = new Logger();

export default logger;
