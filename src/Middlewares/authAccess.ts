import { Request, Response, NextFunction } from "express";
import User from "../Models/User";
import { verifyJWT } from "../Utils/jwt";
import Sequelize from "sequelize";
import logger from "../Logger";
import cloneDeep from "clone-deep";

export const authAccess = async (
    req: Request,
    res: Response,
    nextFn: NextFunction
) => {
    try {
        let user: User | null;
        const verification = req.headers.authorization?.replace("Bearer ", "");
        if (verification) {
            const data: any = verifyJWT(verification, true);
            if (typeof data === "object") {
                user = await User.findOne({
                    where: { phone_number: data.uuid },
                });

                if (!user || !user.is_verified) {
                    return res
                        .status(401)
                        .send({ error: "Authorization failed" });
                }

                if (data.exp < Math.floor(Date.now() / 1000) && user) {
                    //cheking for expiration
                    user.access_token = "";
                    await user.save();
                    return res
                        .status(401)
                        .send({ error: "Authorization failed" });
                }

                if (user.access_token !== data.access_token) {
                    return res
                        .status(401)
                        .send({ error: "Authorization failed" });
                }

                if (
                    (!user.linked_demat ||
                        user.linked_demat === "" ||
                        user.linked_demat === undefined ||
                        user.linked_demat === null) &&
                    req.path !== "/link"
                ) {
                    return res
                        .status(401)
                        .send({ error: "Please link demant account" });
                }

                if (!user) {
                    throw new Error();
                }

                req.body.user = user;
                req.body.access_token = data.access_token;
                nextFn();
            } else {
                return res.status(401).send({ error: "Authorization failed" });
            }
        } else {
            return res.status(401).send({ error: "Authorization failed" });
        }
    } catch (error) {
        console.log(error);
        logger.log("error", "Authentication failed" + cloneDeep(error));
        return res.status(401).send({ error: "Authorization failed" });
    }
};
