import cloneDeep from "clone-deep";
import { customAlphabet } from "nanoid";
import logger from "../Logger";
import Trade from "../Models/Trade";
import User from "../Models/User";
import UserTrades from "../Models/UserTrade";

import { getTradeAndUserTrade } from "../Utils/getTradeAndUserTrade";
import {
  checkForValidityAndCancelSLForIntraday,
  checkValidityAndCancelSLForDelivery,
  freeOrPaidTrade,
  isAlllowedForSell,
  isAllowedForCancel,
  isAllowedForSL,
  isValidTradeToPlaceOrder,
  validitySLChecksForIntraday,
  validitySLChecksForPositional,
} from "../Utils/preRequisites";
import {
  SamcoSellOrderForBoth,
  cancelOrder,
  placeOrderForIntraday,
  placeOrderForPositional,
  placeOrderForSL,
} from "./AbstractionLayer";
import {
  saveUserAfterPlacingSlOrder,
  saveUserTradeAfterPlacingOrder,
} from "../Utils/postRequisites";
import { addUserToCheckListForBuy } from "../Utils/redisForChecker";

export const placeOrder = async (
  tradeId: string,
  quantity: number,
  user: User,
  amount: number
) => {
  const trade = await Trade.findOne({ where: { trade_id: tradeId } });

  if (!trade) {
    throw new Error("Trade not found");
  }

  isValidTradeToPlaceOrder(trade);

  const isUsingFreeOrPaid = freeOrPaidTrade(
    user.free_trades_available,
    user.free_trade_last_used,
    user.is_subscription
  );

  if (isUsingFreeOrPaid.message !== "") {
    throw new Error(`${isUsingFreeOrPaid.message}`);
  }

  if (user.trades_unlocked.includes(trade.uuid)) {
    throw new Error("Can place only one order for one idea");
  }

  switch (trade.product_type) {
    case "INTRADAY":
      const orderResponseIntraday = await placeOrderForIntraday(
        quantity,
        trade,
        amount,
        user
      );
      await addUserToCheckListForBuy(
        user.demat_access_token as string,
        trade.trading_symbol,
        orderResponseIntraday,
        `${quantity}`,
        trade.uuid
      );
      const isSuccessIntraday = await saveUserTradeAfterPlacingOrder(
        user,
        trade,
        orderResponseIntraday,
        quantity,
        isUsingFreeOrPaid.isFree
      );

      return isSuccessIntraday;
      break;

    case "DELIVERY":
      const orderResponsePositional = await placeOrderForPositional(
        quantity,
        trade,
        amount,
        user
      );
      await addUserToCheckListForBuy(
        user.demat_access_token as string,
        trade.trading_symbol,
        orderResponsePositional,
        `${quantity}`,
        trade.uuid
      );
      const isSuccessPoisitional = await saveUserTradeAfterPlacingOrder(
        user,
        trade,
        orderResponsePositional,
        quantity,
        isUsingFreeOrPaid.isFree
      );

      return isSuccessPoisitional;
      break;

    default:
      console.log("I am defaulted with values");
      console.log(
        "Trade id : ",
        trade.uuid,
        " User id is : ",
        user.uuid,
        " Trade product type is  : ",
        trade.product_type
      );
      return false;
      break;
  }

  console.log("UNREACHABLE CODE, PLEASE CHECK");
};

export const addedSL = async (
  tradeId: string,
  clientTradeId: string,
  user: User,
  amount: number
) => {
  const { trade, userTrade } = await getTradeAndUserTrade(
    tradeId,
    clientTradeId
  );

  if (!trade || !userTrade) {
    throw new Error("No trade found");
  }

  if (userTrade.current_status !== "EXECUTED") {
    throw new Error("Trade not executed yet, please wait");
  }

  isAllowedForSL(trade, userTrade);
  switch (trade.product_type) {
    case "INTRADAY":
      const alreadyHasSL = await validitySLChecksForIntraday(
        user,
        userTrade,
        trade
      );
      console.log(alreadyHasSL);
      if (alreadyHasSL) {
        if (userTrade.has_sl) {
          return { hasSL: true, message: "You already have an SL" };
        } else {
          return {
            hasSL: true,
            message:
              "SL placed from outside Tactic, Please cancel SL again to place from Tactic",
          };
        }
      }
      const orderResponse = await placeOrderForSL(
        user,
        trade,
        userTrade,
        amount
      );
      await saveUserAfterPlacingSlOrder(orderResponse, userTrade, trade);
      return { hasSL: true, message: "Stoploss placed" };
      break;

    case "DELIVERY":
      const alreadyHasSLForDelivery = await validitySLChecksForPositional(
        user,
        userTrade,
        trade
      );
      if (alreadyHasSLForDelivery) {
        if (userTrade.has_sl) {
          return { hasSL: true, message: "You already have an SL" };
        } else {
          return {
            hasSL: true,
            message:
              "SL placed from outside Tactic, Please cancel SL again to place from Tactic",
          };
        }
      }
      const orderResponseForDelivery = await placeOrderForSL(
        user,
        trade,
        userTrade,
        amount
      );
      await saveUserAfterPlacingSlOrder(
        orderResponseForDelivery,
        userTrade,
        trade
      );
      return { hasSL: true, message: "Stoploss placed" };
      break;

    default:
      console.log("I am defaulted with values");
      console.log(
        "Trade id : ",
        trade.uuid,
        " User id is : ",
        user.uuid,
        " Trade product type is  : ",
        trade.product_type
      );
      return {
        hasSL: false,
        message: "Servers went for tea break",
      };
      break;
  }
};

export const cancle = async (
  tradeId: string,
  client_trade_uuid: string,
  user: User
) => {
  const { trade, userTrade } = await getTradeAndUserTrade(
    tradeId,
    client_trade_uuid
  );

  if (!userTrade) {
    throw new Error("Trade not found on user profile !");
  }

  if (!trade) {
    throw new Error("Couldn't found this trade");
  }

  isAllowedForCancel(userTrade, trade);
  const isCanceled = await cancelOrder(user, trade, userTrade);
  return isCanceled;
};

export const sell = async (
  tradeId: string,
  client_trade_uuid: string,
  user: User
) => {
  let success = false;
  const { trade, userTrade } = await getTradeAndUserTrade(
    tradeId,
    client_trade_uuid
  );

  if (!userTrade) {
    throw new Error("Trade not found on user profile !");
  }

  if (!trade) {
    throw new Error("Couldn't found this trade");
  }
  isAlllowedForSell(userTrade, trade);
  if (userTrade.current_status !== "EXECUTED") {
    throw new Error("Trade not executed yet, please wait");
  }

  switch (trade.product_type) {
    case "INTRADAY":
      await checkForValidityAndCancelSLForIntraday(user, userTrade, trade);
      const response = await SamcoSellOrderForBoth(user, userTrade, trade);
      return response;
      break;
    case "DELIVERY":
      await checkValidityAndCancelSLForDelivery(user, userTrade, trade);
      const responseDelivery = await SamcoSellOrderForBoth(
        user,
        userTrade,
        trade
      );
      return responseDelivery;
      break;
    default:
      console.log(" I DONT NOW WHY WE ARE HERE, BUT WE ARE<3");
      return false;
      break;
  }
};