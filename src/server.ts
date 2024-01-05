"use strict";

import express, { NextFunction, Request } from "express";
import { json } from "body-parser";
import userBrokerageRoutes from "./Routes/index";
import { authAccess } from "./Middlewares/authAccess";
import logger from "./Logger/index";
import { connect } from "./Database/connection";
import Trade from "./Models/Trade";
import helmet from "helmet";
import { userLimiter } from "./Utils/rateLimiter";
import client from "./Utils/redis";
import User from "./Models/User";
import cors from "cors";
import Cryptr from "cryptr";
import allowCORS from "./Middlewares/allowCORS";
import { checkType } from "./Utils/checkTypes";
import morgan from "morgan";
import "./Utils/notification";
import "./Utils/zeromq";
import { profileResponse } from "./Types/SamcoResponse";
const SmartAPI = require("smartapi-javascript");
const cryptr = new Cryptr(process.env.DEMAT_SECRET);

//Env Variable
const PORT = process.env.PORT || 3000;

const app = express();
app.set("trust proxy", true);
morgan.token("body", (req: Request, res: any) => JSON.stringify(req.body));
morgan.token("date", function () {
  var p = new Date()
    .toString()
    .replace(/[A-Z]{3}\+/, "+")
    .split(/ /);
  return p[2] + "/" + p[1] + "/" + p[3] + ":" + p[4] + " " + p[5];
});
app.use(
  morgan(
    ':remote-addr - :remote-user :date ":method :body :url HTTP/:http-version" :status  :res[content-length] - :response-time ms'
  )
);

app.use(helmet());

var allowedOrigins = ["https://samco.tactic.money", "https://tactic.money"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

let allowCrossDomain = function (req: Request, res: any, next: NextFunction) {
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
};

app.use(allowCrossDomain as any);

app.use(
  json({
    limit: "8kb",
  })
);

try {
  const fn = async () => {
    const { userDatabase, brokersDatabase } = await connect();

    await userDatabase
      .sync()
      .then((result: any) => {})
      .catch((err: any) => {
        console.log(err);
      });

    await brokersDatabase
      .sync()
      .then((result: any) => {})
      .catch((err: any) => {
        console.log(err);
      });

    // await Trade.drop();
  };
  fn();
} catch (error) {
  logger.error("Database connection error");
}

app.get("/brokerage/link/:id", allowCORS, async (req, res) => {
  try {
    checkType([req.params.id, "User Id", "string"]);
    const userValidaity = await client.get(req.params.id);
    console.log(userValidaity);
    if (!userValidaity) {
      throw new Error("Authentication failed");
    }
    return res.status(200).send({
      link: `https://api.stocknote.com/login`,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ success: false, message: "something went wrong" });
  }
});

app.use("/brokerage", userLimiter, authAccess, userBrokerageRoutes);

app.post("/authenticateBroker", async (req, res) => {
  try {
    const userUuid = await client.get(req.body.id);
    const authToken = req.body.auth as string;
    const refreshToken = req.body.refresh as string;
    const user = await User.findOne({ where: { uuid: userUuid } });
    if (!user) {
      throw new Error("User not found");
    }
    let smart_api = new SmartAPI.SmartAPI({
      api_key: process.env.ANGLEONE_API_KEY,
      access_token: authToken,
    });
    console.log(authToken);
    const profile: profileResponse = await smart_api.getProfile();
    console.log(profile);
    const encryptDematVal = cryptr.encrypt(profile.data.clientcode);
    const alreadyUser = await User.findOne({
      where: {
        demat_client_code: encryptDematVal,
        linked_demat: "SAMCO",
      },
    });
    if (alreadyUser) {
      if (alreadyUser.uuid === user.uuid) {
        user.demat_access_token = authToken;
        user.demat_refresh_token = refreshToken;
        await user.save();

        // acccess token updated Notification
      } else {
        console.log("some one has it too");

        //send notification that demat has linked with another account
        //return
      }
    } else {
      if (user.linked_demat === null || user.linked_demat === "SAMCO") {
        user.demat_access_token = authToken;
        user.demat_refresh_token = refreshToken;
        user.demat_client_code = encryptDematVal;
        user.linked_demat = "SAMCO";
        await user.save();

        //send notification that account is linked
        //return
      } else {
        console.log(user.demat_access_token);
        console.log(authToken);
        console.log(refreshToken, "noone has it");
        user.demat_access_token = authToken;
        user.demat_refresh_token = refreshToken;
        await user.save();
        //send notification that account is not linked because trying to connect wrong demat
        //return
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ success: false, message: "Something went wrong" });
  }
});

//Running Server
app.listen(PORT, () => {
  try {
    console.log(`App is running on PORT : ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});