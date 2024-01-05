import Trade from "../../Models/Trade";
import User from "../../Models/User";
import UserTrades from "../../Models/UserTrade";
import { checkFundsForIntraday, checkFundsForPoisitional } from "../../Utils/preRequisites";
import { SamcoDeleteorders, SamcoOrderBook, SamcoPlaceOrder, SamcoPlaceSLOrder, SamcoSellOrder } from "../SamcoSDK";

export const placeOrderForIntraday = async (
    quantity: number,
    trade: Trade,
    amount: number,
    user: User
  ) => {
    const haveAvailableCashToTrade = checkFundsForIntraday(
      quantity,
      trade.price,
      amount
    );
    if (!haveAvailableCashToTrade) {
      throw new Error("Insufficient balance");
    }
    const orderPlaced = await SamcoPlaceOrder(user, trade, quantity);
    console.log("Order Response is : ", orderPlaced);
    return orderPlaced;
  };
  
  export const placeOrderForPositional = async (
    quantity: number,
    trade: Trade,
    amount: number,
    user: User
  ) => {
    const haveAvailableCashToTrade = checkFundsForPoisitional(
      quantity,
      trade.price,
      amount
    );
    if (!haveAvailableCashToTrade) {
      throw new Error("Insufficient balance");
    }
    const orderPlaced = await SamcoPlaceOrder(user, trade, quantity);
    console.log("Order Response is : ", orderPlaced);
    return orderPlaced;
  };
  
  export const placeOrderForSL = async (
    user: User,
    trade: Trade,
    userTrade: UserTrades,
    amount: number
  ) => {
    // const haveAvailableCashToTrade = checkFundsForIntraday(
    //   userTrade.quantity,
    //   trade.stop_loss,
    //   amount
    // );
    // if (!haveAvailableCashToTrade) {
    //   throw new Error("Insufficient balance");
    // }
    const orderPlaced = await SamcoPlaceSLOrder(user, userTrade, trade);
    console.log("Order SL Response is : ", orderPlaced);
    return orderPlaced;
  };
  
  export const cancelOrder = async (
    user: User,
    trade: Trade,
    userTrade: UserTrades
  ) => {
    const orderBook = await SamcoOrderBook(user.demat_access_token as string);
    console.log(orderBook);
    const foundTrade = orderBook.filter(
      (order) => order.id === `${userTrade.broker_order_id}`
    );
  
    if (foundTrade.length === 0) {
      throw new Error("Trade not found");
    }
    console.log(foundTrade[0]);
    if (foundTrade[0].status === 4 || foundTrade[0].status === 6) {
      const response = await SamcoDeleteorders(
        user.demat_access_token as string,
        userTrade.broker_order_id
      );
      if (response) {
        userTrade.current_status = "CANCELLED";
        await userTrade.save();
  
        return { success: true, message: "Cancelled successfully" };
      } else {
        return {
          success: true,
          message: "Order is not open, cannot be cancelled",
        };
      }
    } else {
      return {
        success: true,
        message: "Order is not open, cannot be cancelled",
      };
    }
  };
  
  export const SamcoSellOrderForBoth = async (
    user: User,
    userTrade: UserTrades,
    trade: Trade
  ) => {
    const sellOrder = await SamcoSellOrder(user, trade, userTrade);
    if (typeof sellOrder === "undefined") {
      return false;
    }
    if (typeof sellOrder === "string") {
      userTrade.current_status = "TRADED";
      userTrade.broker_exit_status = "PENDING";
      userTrade.broker_exit_id = sellOrder;
      //Add to queue to check for status for exit price;
      await userTrade.save();
      return true;
    }
    if (typeof sellOrder === "boolean") {
      return false;
    }
  
    if (typeof sellOrder === "object") {
      if (sellOrder.success) {
        return { success: true, html: sellOrder.html };
      } else {
        return false;
      }
    }
  };