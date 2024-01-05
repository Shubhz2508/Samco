import { SequelizeScopeError } from "sequelize/types";

export const errorPrettier = (error: any) => {
    let errors: object[] = [];

    const ErrorConverted: Error = error;
    //Check type catching
    if (error?.field && error?.validation) {
        errors.push({ message: error });
    }

    //Errors thrown by code

    if (ErrorConverted.name === "Error") {
        errors.push({ message: ErrorConverted.message });
    }

    // Errors by Sequelize
    if (ErrorConverted.name === "SequelizeValidationError") {
        if (error.errors.type === "Validation error") {
            errors.push({ message: error.errors.message });
        }
        errors.push({ message: `invalid ${error.errors.path}` });
    }

    if (ErrorConverted.name === "SequelizeDatabaseError") {
        errors.push({ message: error.message });
    }

    if (process.env.NODE_ENV === "development") {
        return { errors, error };
    }
    return errors;
};