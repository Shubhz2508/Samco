
import { Router } from "express";
import client from "../Utils/redis";
import { v4 } from "uuid";
import { checkType } from "../Utils/checkTypes";
import { errorPrettier } from "../Utils/errorPrettier";
import { verifyAccessToken } from "../Utils/verifyAccessToken";
import { addedSL, cancle, placeOrder } from "../Services";
import logger from "../Logger";
import cloneDeep from "clone-deep";
import allowCORS from "../Middlewares/allowCORS";
import { getNetAvailableMargin } from "../Utils/getFunds";

const router = Router();

router.post("/link", async (req, res) => {
  try {
    const id = v4();
    await client.set(id, JSON.stringify({ uuid: req.body.user.uuid }), {
      EX: 3600,
    });
    return res.send({
      success: 1,
      userId: id,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ success: false, message: "something went wrong" });
  }
});

router.put("/placeOrder", async (req, res) => {
  try {
    const { tradeId, quantity } = req.body as {
      tradeId: string;
      quantity: number;
    };
    checkType(
      [tradeId, "Order ID", "string"],
      [quantity, "quantity", "string"]
    );
    if (req.body.user.linked_demat !== "SAMCO") {
      return res
        .status(400)
        .send({ success: false, message: "Please link Samco" });
    }
    const validAccessToken = await verifyAccessToken(req.body.user);
    if (!validAccessToken.success) {
      return res
        .status(400)
        .send({ success: false, message: "Please relink your broker" });
    }
    const user = req.body.user; // Assuming `req.body.user` contains the user object

    const netAvailableMargin = await getNetAvailableMargin(user); // Call getNetAvailableMargin with the user object

    if (netAvailableMargin === null) {
      throw new Error("Failed to get net available margin");
    }

    const isPlaced = await placeOrder(tradeId, quantity, user, netAvailableMargin);
    console.log(isPlaced);
    if (!isPlaced) {
      throw new Error("Something went wrong while placing Order, Please try again later");
    }
    return res.send({ success: 1, message: "Order placed" });
  } catch (err) {
    logger.log(
      "error",
      `Error at placing order for broker Samco` + cloneDeep(err)
    );
    return res.status(400).send({ success: 1, message: "Order failed" });
  }
});


router.put("/addSL", async (req, res) => {
  try {
    let { tradeId, clientTradeId } = req.body as {
      tradeId: string;
      clientTradeId: string;
    };
    checkType(
      [tradeId, "Order ID", "string"],
      [clientTradeId, "Client trade ID", "string"]
    );
    if (req.body.user.linked_demat !== "SAMCO") {
      return res
        .status(400)
        .send({ success: false, message: "Please link SAMCO" });
    }
    const validAccessToken = await verifyAccessToken(req.body.user);
    if (!validAccessToken.success) {
      return res
        .status(400)
        .send({ success: false, message: "Please relink your broker" });
    }

    const user = req.body.user; // Assuming `req.body.user` contains the user object

    const netAvailableMargin = await getNetAvailableMargin(user); // Call getNetAvailableMargin with the user object

    if (netAvailableMargin === null) {
      throw new Error("Failed to get net available margin");
    }

    const hasSL = await addedSL(tradeId, clientTradeId, user, netAvailableMargin);
    console.log("response is: ", hasSL);
    if (hasSL.hasSL) {
      return res.send(hasSL);
    } else {
      return res.status(400).send(hasSL);
    }
  } catch (err) {
    logger.log(
      "error",
      `Error at modifying order for broker SAMCO` + cloneDeep(err)
    );
    return res.status(400).send(errorPrettier(err));
  }
});

router.put("/cancle", async (req, res) => {
  try {
    let { tradeId, clientTradeId } = req.body as {
      tradeId: string;
      clientTradeId: string;
    };
    checkType(
      [tradeId, "Trade ID", "string"],
      [clientTradeId, "Client trade ID", "string"]
    );
    if (req.body.user.linked_demat !== "Samco") {
      return res
        .status(400)
        .send({ success: false, message: "Please link Samco" });
    }
    const validAccessToken = await verifyAccessToken(req.body.user);
    if (!validAccessToken.success) {
      return res
        .status(400)
        .send({ success: false, message: "Please relink your broker" });
    }
    const cancled = await cancle(tradeId, clientTradeId, req.body.user);
    console.log("Cancelled order is : ", cancled);
    if (!cancled) {
      throw new Error(
        "Something went wrong while cancelling Order, Please try again later"
      );
    }
    return res.send({
      success: 1,
      message: `Order cancelled`,
    });
  } catch (err) {
    logger.log(
      "error",
      `Error at cancelling order for broker SAMCO` + cloneDeep(err)
    );
    return res.status(400).send(errorPrettier(err));
  }
});

router.put("/sell", async (req, res) => {
  try {
    let { tradeId, clientTradeId } = req.body as {
      tradeId: string;
      clientTradeId: string;
    };
    checkType(
      [tradeId, "Trade ID", "string"],
      [clientTradeId, "Client trade ID", "string"]
    );

    if (req.body.user.linked_demat !== "SAMCO") {
      return res
        .status(400)
        .send({ success: false, message: "Please link SAMCO" });
    }
    const validAccessToken = await verifyAccessToken(req.body.user);
    if (!validAccessToken.success) {
      return res
        .status(400)
        .send({ success: false, message: "Please relink your broker" });
    }
    const isSold = await sell(tradeId, clientTradeId, req.body.user);
    console.log(isSold);
    if (typeof isSold === "object") {
      return res.send(isSold);
    }
    if (!isSold) {
      throw new Error(
        "Something went wrong while cancelling Order, Please try again later"
      );
    }
    return res.send({
      success: 1,
      message: `Order Sold`,
    });
  } catch (err) {
    logger.log(
      "error",
      `Error at cancelling order for broker Samco` + cloneDeep(err)
    );
    return res.status(400).send(errorPrettier(err));
  }
});

export default router;
