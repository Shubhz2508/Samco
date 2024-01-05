import axios from 'axios';
import { PositionSummaryResponse, PositionDetails, OrderBookDetailsResponse, OrderDetails, cancelOrderResponse, OrderDetailsResponse, HoldingDetails, HoldingSummaryResponse } from "../../Types/SamcoResponse";
import User from '../../Models/User';
import Trade from '../../Models/Trade';
import { sendNotification } from "../../Utils/notification";
import UserTrades from "../../Models/UserTrade";
import client from '../../Utils/redis';


export const SamcoPlaceOrder = async (
  user: User,
  trade: Trade,
  quantity: number
): Promise<OrderDetailsResponse | undefined> => {
  try {
    console.log("For user : ", user.demat_client_code);
    console.log(
      "Values are : ",
      trade.uuid,
      trade.transaction_type,
      trade.exchange,
      trade.product_type,
      trade.order_type,
      trade.duration,
      trade.trading_symbol,
      trade.symbol_token,
      quantity,
      trade.price
    );
    const requestBody = {
      tradingSymbol: trade.trading_symbol,
      quantity: quantity,
      orderType: "L",
      transactionType: trade.transaction_type === "BUY" ? 1 : -1,
      productType: trade.product_type === "INTRADAY" ? "INTRADAY" : "CNC",
      orderPrice: parseFloat(trade.price),
      orderValidity: "DAY",
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-session-token': user.demat_access_token,
    };

    const response = await axios.post<OrderDetailsResponse>(
      'https://api.stocknote.com/order/placeOrder',
      JSON.stringify(requestBody),
      { headers }
    );

    const { status } = response.data;

    if (status !== 'Success') {
      sendNotification(
        user.notification_id,
        "Something went wrong",
        "Please check your broker for further details",
        "Try Again"
      );

      throw new Error("Order failed");
    }

    sendNotification(
      user.notification_id,
      `Your ${trade.trading_symbol} order has been placed`,
      "We will notify you when the order has been executed",
      "Explore more trades"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};


export const SamcoPlaceSLOrder = async (
  user: User,
  trade: Trade,
  userTrade: UserTrades,
): Promise<OrderDetailsResponse | undefined> => {
  console.log("For user : ", user.demat_client_code);
  console.log(
    "Values are : ",
    trade.uuid,
    trade.transaction_type,
    trade.exchange,
    trade.product_type,
    trade.order_type,
    trade.duration,
    trade.trading_symbol,
    trade.symbol_token,
    userTrade.quantity,
    trade.stop_loss
  );
  const cmps = (await client.get("cmps")) as string;
  let reqCmp = JSON.parse(cmps).filter(
    (_cmp: any) => _cmp.name === trade.trading_symbol
  )[0];
  if (trade.transaction_type === "BUY") {
    if (reqCmp.price < trade.stop_loss) {
      try {
        const requestBody = {
          tradingSymbol: trade.trading_symbol,
          quantity: `${userTrade.quantity}`,
          orderType: "MKT",
          exchange: "NSE",
          transactionType: trade.transaction_type === "BUY" ? 1 : -1,
          productType: trade.product_type,
          orderPrice: parseFloat(trade.price),
          orderValidity: "DAY",
        };

        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-token': user.demat_access_token,
        };

        const response = await axios.post<OrderDetailsResponse>(
          'https://api.stocknote.com/order/placeOrder',
          JSON.stringify(requestBody),
          { headers }
        );

        const { status } = response.data;

        if (status !== 'Success') {
          sendNotification(
            user.notification_id,
            "Something went wrong",
            "Please check your broker for further details",
            "Try Again"
          );

          throw new Error("Order failed");
        }

        sendNotification(
          user.notification_id,
          `Your ${trade.trading_symbol} order has been placed`,
          "We will notify you when the order has been executed",
          "Explore more trades"
        );
        return response.data;
      } catch (error) {
        console.error(error);
        return undefined;
      }

    } else try {

      const requestBody = {
        tradingSymbol: trade.trading_symbol,
        quantity: `${userTrade.quantity}`,
        orderType: "SL-M",
        exchange: "NSE",
        transactionType: trade.transaction_type === "BUY" ? 1 : -1,
        productType: trade.product_type,
        orderPrice: 0,
        triggerPrice: parseFloat(trade.stop_loss),
        orderValidity: "DAY",
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-session-token': user.demat_access_token,
      };

      const response = await axios.post<OrderDetailsResponse>(
        'https://api.stocknote.com/order/placeOrder',
        JSON.stringify(requestBody),
        { headers }
      );

      const { status } = response.data;

      if (status !== 'Success') {
        sendNotification(
          user.notification_id,
          "Something went wrong",
          "Please check your broker for further details",
          "Try Again"
        );

        throw new Error("Order failed");
      }

      sendNotification(
        user.notification_id,
        `Your ${trade.trading_symbol} order has been placed`,
        "We will notify you when the order has been executed",
        "Explore more trades"
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  } else  {
    if (reqCmp.price > trade.stop_loss) {
      try {
        const requestBody = {
          tradingSymbol: trade.trading_symbol,
          quantity: `${userTrade.quantity}`,
          orderType: "MKT",
          exchange: "NSE",
          transactionType: trade.transaction_type === "BUY" ? 1 : -1,
          productType: trade.product_type,
          orderPrice: 0,
          triggerPrice: 0,
          orderValidity: "DAY",
        };
  
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-token': user.demat_access_token,
        };
  
        const response = await axios.post<OrderDetailsResponse>(
          'https://api.stocknote.com/order/placeOrder',
          JSON.stringify(requestBody),
          { headers }
        );
  
        const { status } = response.data;
  
        if (status !== 'Success') {
          sendNotification(
            user.notification_id,
            "Something went wrong",
            "Please check your broker for further details",
            "Try Again"
          );
  
          throw new Error("Order failed");
        }
  
        sendNotification(
          user.notification_id,
          `Your ${trade.trading_symbol} order has been placed`,
          "We will notify you when the order has been executed",
          "Explore more trades"
        );
        return response.data;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    } else {
      try {
        const requestBody = {
          tradingSymbol: trade.trading_symbol,
          quantity: `${userTrade.quantity}`,
          orderType: "SL-M",
          exchange: "NSE",
          transactionType: trade.transaction_type === "BUY" ? 1 : -1,
          productType: trade.product_type,
          orderPrice: 0,
          triggerPrice: parseFloat(trade.stop_loss),
          orderValidity: "DAY",
        };
  
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-session-token': user.demat_access_token,
        };
  
        const response = await axios.post<OrderDetailsResponse>(
          'https://api.stocknote.com/order/placeOrder',
          JSON.stringify(requestBody),
          { headers }
        );
  
        const { status } = response.data;
  
        if (status !== 'Success') {
          sendNotification(
            user.notification_id,
            "Something went wrong",
            "Please check your broker for further details",
            "Try Again"
          );
  
          throw new Error("Order failed");
        }
  
        sendNotification(
          user.notification_id,
          `Your ${trade.trading_symbol} order has been placed`,
          "We will notify you when the order has been executed",
          "Explore more trades"
        );
        return response.data;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    }
  } 
}


export const SamcoDeleteorders = async (token: string, orderId: string) => {
  const headers = {
    'Accept': 'application/json',
    'x-session-token': token,
  };

  try {
    const response = await axios.delete<cancelOrderResponse>(
      'https://api.stocknote.com/order/cancelOrder?orderNumber=${orderId}',
      { headers }
    );

    const { status } = response.data;

    if (status !== 'Success') {
      console.log('Cannot cancel order.');
    } else {
      return response.cancelOrderResponse
    }
  } catch (error) {
    console.error(error);
  }

}

export const SamcoSellOrder = async (
  user: User,
  trade: Trade,
  userTrade: UserTrades
) => { 
  try {

    const requestBody = {
      tradingSymbol: trade.trading_symbol,
      quantity: userTrade.quantity,
      orderType: "MKT",
      transactionType: trade.transaction_type === "BUY" ? 1 : -1,
      productType: trade.product_type === "INTRADAY" ? "INTRADAY" : "CNC",
      price: 355,
      triggerPrice: 0,
      orderValidity: "DAY",
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-session-token': user.demat_access_token,
    };

    const response = await axios.post<OrderDetailsResponse>(
      'https://api.stocknote.com/order/placeOrder',
      JSON.stringify(requestBody),
      { headers }
    );

    const { status } = response.data;

    if (status !== 'Success') {
      sendNotification(
        user.notification_id,
        "Something went wrong",
        "Please check your broker for further details",
        "Try Again"
      );

      if (trade.product_type === "DELIVERY") {
        const edisApproved = await client.get(
          `EDIS_SAMCO_${user.demat_client_code}`
        );
        if (edisApproved && edisApproved.toUpperCase() === "TRUE") {
          return sendNotification(
            user.notification_id,
            "Your EDIS is approved",
            `Sell your ${trade.trading_symbol} Delivery trades now`,
            "SELL"
          );
        } else {
          if (edisApproved) {
            return sendNotification(
              user.notification_id,
              "Your EDIS is in process",
              `Please wait while EDIS for ${trade.trading_symbol} is in process`,
              "Explore other trades !"
            );
          } else {
            sendNotification(
              user.notification_id,
              "Something didn't seem right",
              "Trying to sell delivery order via EDIS",
              "Please wait in the app, while we generate your EDIS"
            );
            await client.set(`EDIS_SAMCO_${user.demat_client_code}`, "FALSE");
          }
        }
      }
      
      throw new Error("Order failed");
    }

    sendNotification(
      user.notification_id,
      `Your ${trade.trading_symbol} order has been placed`,
      "We will notify you when the order has been executed",
      "Explore more trades"
    );
    return response.data;
  } catch (error) {
    // Handle errors here
    console.error(error);
  }
};


export const SamcoGetPositions = async (token: string): Promise<PositionDetails | undefined> => {
  const headers = {
    'Accept': 'application/json',
    'x-session-token': token,
  };

  try {
    const response = await axios.get<PositionSummaryResponse>(
      'https://api.stocknote.com/position/getPositions?positionType=DAY',
      { headers }
    );

    const { status } = response.data;

    if (status !== 'Success') {
      console.log('Something went wrong.');
      return undefined;
    } else {
      return response.PositionDetails;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const SamcoGetHoldings = async (token: string): Promise<HoldingDetails | undefined> => {
  const headers = {
    'Accept': 'application/json',
    'x-session-token': token,
  };

  try {
    const response = await axios.get<HoldingSummaryResponse>(
      'https://api.stocknote.com/holding/getHoldings',
      { headers }
    );

    const { status } = response.data;

    if (status !== 'Success') {
      console.log('Something went wrong.');
      return undefined;
    } else {
      return response.HoldingDetails;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};


export const SamcoOrderBook = async (token: string): Promise<OrderDetails[] | undefined> => {
  const headers = {
    'Accept': 'application/json',
    'x-session-token': token,
  };

  try {
    const response = await axios.get<OrderBookDetailsResponse>(
      'https://api.stocknote.com/order/orderBook',
      { headers }
    );

    const { status } = response.data;

    if (status !== 'Success') {
      console.log('Something went wrong. Cannot get order book.');
      return undefined;
    } else {
      return response.data.OrderDetails || []; // Ensure it's an array or provide a default empty array
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};






export const SamcoDeleteorderForSl = async (token: string, orderId: string) => {
  const headers = {
    'Accept': 'application/json',
    'x-session-token': token,
  };

  try {
    const response = await axios.delete<cancelOrderResponse>(
      'https://api.stocknote.com/order/cancelOrder?orderNumber=${orderId}',
      { headers }
    );

    const { status } = response.data;

    if (status !== 'Success') {
      console.log('Cannot cancel order.');
    } else {
      return response.cancelOrderResponse
    }
  } catch (error) {
    console.error(error);
  }

}