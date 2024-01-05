import logger from "../Logger";
import Trade from "../Models/Trade";
import User from "../Models/User";
import UserTrades from "../Models/UserTrade";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet(
    "12345567890qwertyuioplkjhgfdsazxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ"
);


export const saveUserTradeAfterPlacingOrder = async (
    user: User,
    trade: Trade,
    orderDetails: { script: string; orderid: string },
    quantity: number,
    usingFree: boolean
) => {
    try {
        await UserTrades.create({
            user_uuid: user.uuid,
            user_notification_id: user.notification_id,
            trade_uuid: trade.uuid,
            current_status: "PENDING",
            quantity: quantity,
            brokerage: "SAMCO",
            broker_order_id: orderDetails.orderid,
            price: trade.price,
            trade_type: trade.transaction_type,
            client_trade_uuid: nanoid(),
            demat_client_id: user.demat_client_code,
        });

        console.log("CREATED USER TRADE");

        if (usingFree) {
            user.free_trades_available = user.free_trades_available - 1;
            user.free_trade_last_used = `${Math.ceil(Date.now() / 1000)}`;
            //tradeAdmin
            console.log("DEDUCTED FREE TRADE");
        }

        user.trades_unlocked = [...user.trades_unlocked, trade.uuid];
        console.log("ADDED TRADE TO TRADE UNLOCKED");
        await user.save();
        console.log("SAVING USER");
        return true;

    } catch (err) {
        logger.log(
            "emerg",
            `emerg at saving order for broker SAMCO`,
            `${JSON.stringify(orderDetails)} && User: ${user.uuid} && Trade id: ${
              trade.uuid
            } && quantity : ${quantity} && orderTag :${trade.order_tag}`
          );
          return false;
    }
}

export const saveUserAfterPlacingSlOrder = async (
    stoploss: { script: string; orderid: string },
    userTrade: UserTrades,
    trade: Trade
  ) => {
    userTrade.has_sl = true;
    userTrade.sl_value = trade.stop_loss;
    userTrade.broker_sl_id = stoploss.orderid;
    userTrade.broker_sl_status = "PENDING";
    await userTrade.save();
  };
