import { Sequelize } from "sequelize";

//Connection to Database
const userDatabase = new Sequelize(process.env.USER_SEQUEL_URL);
const brokersDatabase = new Sequelize(process.env.BROKERS_SEQUEL_URL);

export const connect = async () => {
    try {
        await userDatabase.authenticate();
        await brokersDatabase.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
    return { userDatabase, brokersDatabase };
};

export default { userDatabase, brokersDatabase };
