import winston from "winston";
import "winston-daily-rotate-file";
import "winston-mongodb";
const { combine, timestamp, splat, printf } = winston.format;

const customFormat = printf((info) => {
    return `| Dated : ${new Date(info.timestamp).toLocaleString()} | Level : ${
        info.level
    } | Message : ${info.message.split("error")[0]} | Desc : ${info.stack} \n `;
});

const logger = winston.createLogger({
    level: "debug",
    format: combine(timestamp(), splat(), customFormat),
    transports: [
        new winston.transports.MongoDB({
            level: "info",
            db: process.env.LOGSDB,
            options: {
                useUnifiedTopology: true,
            },
            collection: "logs",
            tryReconnect: true,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "exceptions.log" }),
    ],
});

export default logger;
