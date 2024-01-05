import User from "../Models/User";
import logger from "../Logger";
import cloneDeep from "clone-deep";

export const catchUtils = async (err: any, user: User, type: string) => {
  if (
    err.message ===
    "Authentication failed, User auth failed, Please link brokerage"
  ) {
    user.demat_client_code = null;
    user.demat_password = null;
    user.linked_demat = null;
    await user.save();
  }

  logger.log(
    "error",
    `Error at ${type} order for broker SAMCO` + cloneDeep(err)
  );
  throw new Error("Something went wrong, Please try again");
};