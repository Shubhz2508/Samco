import winston from "winston";
const { timestamp, combine, splat, printf, errors } = winston.format;

const customFormat = printf((info) => {
    return `| Dated : ${new Date(info.timestamp).toLocaleString()} | Level : ${
        info.level
    } | Message : ${info.message.split("error")[0]} | Desc : ${info.stack} \n `;
});

const logger = winston.createLogger({
    level: "debug",
    format: combine(timestamp(), splat(), customFormat),
    transports: [
        new winston.transports.File({
            filename: "./logs/error.log",
            level: "error",
        }),

        new winston.transports.Console({
            format: combine(timestamp(), splat(), customFormat),
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "exceptions.log" }),
    ],
});

export default logger;
