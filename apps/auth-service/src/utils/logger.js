const { createLogger, format, transports } = require('winston');
const LokiTransport = require('winston-loki');

const lokiUrl = process.env.LOKI_URL;

const loggerTransports = [
    new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    })
];

loggerTransports.push(
    new LokiTransport({
        host: lokiUrl,
        labels: { service: 'auth-service', environment: process.env.NODE_ENV || 'development' },
        json: true,
        format: format.json(),
    })
);


const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: loggerTransports,
});

module.exports = logger;