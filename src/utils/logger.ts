import winston from 'winston';

const logger = winston.createLogger({
    level: 'info', // minimalny poziom logowania, można zmienić na 'debug', 'warn', 'error' itd.
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `[${info.timestamp} [${info.level.toUpperCase()}] [${info.context || 'App'}]]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console()
    ],
});

export default logger;
