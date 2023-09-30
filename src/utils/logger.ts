import winston from 'winston';

class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}] [${info.context || 'APP'}]: ${info.message}`)
            ),
            transports: [
                new winston.transports.Console()
            ],
        });
    }

    info(message: string, context?: string) {
        this.logger.info(message, { context });
    }

    error(message: string, context?: string) {
        this.logger.error(message, { context });
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, { context });
    }

    beginLogger(method: string, endpoint: string, body?: any, context?: string) {
        this.logger.info(`${method} request received at ${endpoint} ${!body ? '' : `with body: ${JSON.stringify(body)}`}`, { context: 'API' });
    }

    postSuccessLogger(model: string, context?: string) {
        this.logger.info(`${model} successfully created.`, { context: 'API' });
    }

    postErrorLogger(model: string, errorMessage: string, context?: string) {
        this.logger.error(`Error occurred while creating ${model}: ${errorMessage}`, { context: 'API' });
    }

    getSuccessLogger(model: string, where: any, limit: number | undefined, offset: number | undefined, context?: string) {
        this.logger.info(`Fetching ${model} with conditions: ${JSON.stringify(where)} ${limit ? `, limit: ${limit}` : ''}${offset ? `, offset: ${offset}` : ''}`, { context: 'API' });
    }

    getByIdSuccessLogger(model: string, id: string, context?: string) {
        this.logger.info(`Fetching ${model} with id: ${id}`, { context: 'API' });
    }

    getErrorLogger(model: string, errorMessage: string, context?: string) {
        this.logger.error(`Error occurred while fetching ${model}: ${errorMessage}`, { context: 'API' });
    }

    idNotFoundLogger(model: string, id: string, context?: string) {
        this.logger.error(`${model} not found for ID: ${id}`, { context: 'API' });
    }

    invalidFieldsErrorLogger(endpoint: string, context?: string) {
        this.logger.error(`Invalid fields in request to ${endpoint}`, { context: 'API' });
    }

    patchSuccessLogger(model: string, id: string, context?: string) {
        this.logger.info(`${model} with id: ${id} successfully updated`, { context: 'API' });
    }

    constraintViolationErrorLogger(model: string, id: string, errorMessage: string, context?: string) {
        this.logger.error(`Unique constraint violation updating ${model} with id: ${id} - ${errorMessage}`, { context: 'API' });
    }

    patchInternalErrorLogger(model: string, id: string, errorMessage: string, context?: string) {
        this.logger.error(`Internal Server Error updating ${model} with id: ${id} - ${errorMessage}`, { context: 'API' });
    }
}

const logger = new Logger();

export default logger;
