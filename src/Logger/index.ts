import devLogger from "./devLogger";
import prodLogger from "./prodLogger";

let logger = prodLogger;

if (process.env.NODE_ENV === "development") {
    logger = devLogger;
}

export default logger;
