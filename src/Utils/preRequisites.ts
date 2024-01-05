import Trade from "../Models/Trade";
import { SamcoDeleteorderForSl, SamcoGetPositions, SamcoOrderBook, SamcoGetHoldings } from "../Services/SamcoSDK";
import User from "../Models/User";
import UserTrades from "../Models/UserTrade";


export const isValidTradeToPlaceOrder = (trade: Trade) => {
    if (
        !trade ||
        trade.is_inactive ||
        trade.has_sl ||
        trade.has_ended ||
        trade.close_trade //Safety net, if we close the trade manually so user cant place order
    ) {
        throw new Error(
            "Cannot place order on this trade, Already executed or ended"
        );
    }
};

export const freeOrPaidTrade = (
    tradeAvailable: number,
    lastTradeUsedTime: string,
    isSubscribed: string
) => {
    let usingFree = 0; //0 => Free, 1 => Paid
    let message = "";

    //In Seconds
    if (tradeAvailable > 0) {
        if (parseInt(lastTradeUsedTime) > parseInt(lastTradeUsedTime) + 86400) {
            usingFree = 0;
        } else {
            usingFree = 1;
        }
    } else {
        const isSubValid =
            parseInt(isSubscribed) > Math.floor(Date.now() / 1000) ? true : false;
        if (!isSubValid && usingFree) {
            message =
                "You have exhausted your free trades, Consider purchasing subscription to access more trades.";
        } else {
            if (usingFree === 1) {
                let hours =
                    (parseInt(lastTradeUsedTime) +
                        86400 -
                        Math.floor(Date.now() / 1000)) /
                    3600;
                const dispMesg =
                    Math.ceil(hours) === 0
                        ? `${Math.ceil(hours / 60)} Minute(s)`
                        : `${Math.ceil(hours)} Hour(s)`;
                message = `Please wait ${dispMesg} before trying again Or purchase subscription`;
            }
        }
    }
    return { isFree: !usingFree, message: message };
};

export const checkFundsForIntraday = (
    quantity: number,
    price: string,
    amount: number
) => {
    return amount > parseFloat(price) * 0.2 * quantity;
};

export const checkFundsForPoisitional = (
    quantity: number,
    price: string,
    amount: number
) => {
    return amount > quantity * parseFloat(price);
};

export const isAllowedForSL = (trade: Trade, userTrade: UserTrades) => {
    if (!trade) {
        throw new Error("Trade not found");
    }
    if (!userTrade) {
        throw new Error("Trade not found on user profile !");
    }

    if (
        userTrade.current_status === "PENDING" ||
        userTrade.current_status === "TRADED" ||
        userTrade.current_status === "CANCELLED" ||
        userTrade.current_status === "EXPIRED" ||
        userTrade.current_status === "NT" ||
        userTrade.current_status === "REJECTED" ||
        userTrade.current_status === "NOT_EXECUTED"
    ) {
        throw new Error(`Trade already ${userTrade.current_status}`);
    }
};

export const validitySLChecksForIntraday = async (
    user: User,
    userTrade: UserTrades,
    trade: Trade
) => {
    if (userTrade.has_sl) {
        return true;
    }

    const positions = await SamcoGetPositions(user.demat_access_token as string);
    console.log(positions);

    if (positions) {
        const position = positions.filter(
            (position) =>
                position.exchange === "NSE"
        );

        if (position.length === 0) {
            throw new Error("No trade found");
        }

        console.log("Found Position is : ", position);

        if (
            Math.abs(parseInt(position[0].buyqty) - parseInt(position[0].sellqty)) <
            userTrade.quantity
        ) {
            throw new Error("Invalid Quantity");
        }
    } 

    const orderBook = await SamcoOrderBook(user.demat_access_token as string);
    console.log(orderBook);

    const transactionType = trade.transaction_type === "BUY" ? "SELL" : "BUY";
    const stoplossOrderWithSimilarity = orderBook.filter(
        (order) =>
            order.orderType === "SL" &&
            order.productCode === "MIS" &&
            order.exchange === "NSE"
    );

    console.log(
        "ORDER SIMILARITY FOR SL INTRADAY : ",
        stoplossOrderWithSimilarity
    );

    if (stoplossOrderWithSimilarity.length > 0) {
        return true;
    } else {
        return false;
    }
};


export const validitySLChecksForPositional = async (
    user: User,
    userTrade: UserTrades,
    trade: Trade
) => {
    if (userTrade.has_sl) {
        return true;
    }
    const boughtAt = new Date(`${userTrade.createdAt}` as string).getDate();
    const todayIs = new Date().getDate();
    const isBoughtToday = boughtAt === todayIs ? true : false;
    if (isBoughtToday) {

        const positions = await SamcoGetPositions(user.demat_access_token as string);
        const position = positions.filter(
            (position) =>
                position.productCode === "CNC" &&
                position.exchange === "NSE"
        );
        console.log(positions);
        if (position.length === 0) {
            throw new Error("No trade found");
        }
        console.log("Found Position is : ", position);
        if (
            Math.abs(parseInt(position[0].buyqty) - parseInt(position[0].sellqty)) <
            userTrade.quantity
        ) {
            throw new Error("Invalid Quantity");
        }
    } else {
        const holdings = await SamcoGetHoldings(user.demat_access_token as string);
        const holding = holdings.filter(
            (hold) =>
                hold.symbol === `NSE:${trade.trading_symbol}-EQ` &&
                hold.productType === "CNC" &&
                hold.side === 1
        );

        if (holding.length === 0) {
            throw new Error("No trade found");
        }
        console.log("Found Position is : ", holding);
        if (holding[0].qty < userTrade.quantity) {
            throw new Error("Invalid Quantity");
        }
    }

    const orderBook = await SamcoOrderBook(user.demat_access_token as string);
    const stoplossOrderWithSimilarity = orderBook.filter(
        (order) =>

            order.productCode === "CNC"

    );
    console.log(
        "ORDER SIMILARITY FOR SL INTRADAY : ",
        stoplossOrderWithSimilarity
    );
    if (stoplossOrderWithSimilarity.length > 0) {
        return true;
    } else {
        return false;
    }
};

export const isAllowedForCancel = (userTrade: UserTrades, trade: Trade) => {
    if (!userTrade) {
        throw new Error("Trade not found on user profile !");
    }

    if (!trade) {
        throw new Error("Couldn't found this trade");
    }

    if (
        userTrade.current_status === "TRADED" ||
        userTrade.current_status === "CANCELLED" ||
        userTrade.current_status === "EXECUTED" ||
        userTrade.current_status === "REJECTED" ||
        userTrade.current_status === "EXPIRED" ||
        userTrade.current_status === "NT" ||
        userTrade.current_status === "NOT_EXECUTED"
    ) {
        console.log("here");
        throw new Error(`Trade already ${userTrade.current_status}`);
    }
};

export const isAlllowedForSell = (userTrade: UserTrades, trade: Trade) => {
    if (!userTrade) {
        throw new Error("Trade not found on user profile !");
    }

    if (!trade) {
        throw new Error("Couldn't found this trade");
    }

    if (
        userTrade.current_status === "PENDING" ||
        userTrade.current_status === "CANCELLED" ||
        userTrade.current_status === "TRADED" ||
        userTrade.current_status === "REJECTED" ||
        userTrade.current_status === "EXPIRED" ||
        userTrade.current_status === "NT" ||
        userTrade.current_status === "NOT_EXECUTED"
    ) {
        throw new Error(`Trade already ${userTrade.current_status}`);
    }
};

export const checkForValidityAndCancelSLForIntraday = async (
    user: User,
    userTrade: UserTrades,
    trade: Trade
) => {
    const positions = await SamcoGetPositions(user.demat_access_token as string);
    const position = positions.filter(
        (position) =>
            position.productCode === "MIS"
    );
    if (position.length === 0) {
        throw new Error("No trade found");
    }
    console.log("Found Position is : ", position);
    if (
        Math.abs(parseInt(position[0].buyqty) - parseInt(position[0].sellqty)) <
        userTrade.quantity
    ) {
        throw new Error("Invalid Quantity");
    }
    if (userTrade.has_sl && userTrade.broker_sl_status !== "CANCELLED") {
        const orderBook = await SamcoOrderBook(user.demat_access_token as string);
        const transactionType = trade.transaction_type === "BUY" ? "SELL" : "BUY";
        const stoplossOrderWithSimilarity = orderBook.filter(
            (order) =>
                (order.ordertype === "SL" ||
                    order.ordertype === "SL-M") &&
                order.transactiontype === transactionType &&
                order.exchange === "NSE" &&
                order.orderstatus === "Pending" &&
                order.productCode === "MIS"
        )
        console.log("STOPLOSS ORDER FOUND ARE:", stoplossOrderWithSimilarity);
        if (stoplossOrderWithSimilarity.length > 0) {
            await SamcoDeleteorderForSl(
                user.demat_access_token as string,
                userTrade.broker_sl_id
            );
            userTrade.broker_sl_status = "CANCELLED";
            await userTrade.save();
        }
    }
}


export const checkValidityAndCancelSLForDelivery = async (
    user: User,
    userTrade: UserTrades,
    trade: Trade
) => {
    const boughtAt = new Date(`${userTrade.createdAt}` as string).getDate();
    const todayIs = new Date().getDate();
    const isBoughtToday = boughtAt === todayIs ? true : false;
    if (isBoughtToday) {
        const positions = await SamcoGetPositions(user.demat_access_token as string);
        const position = positions.filter(
            (position) =>
                position.productCode === "CNC" &&
                position.exchange === "NSE"
        );
        console.log(positions);
        if (position.length === 0) {
            throw new Error("No trade found");
        }
        console.log("Found Position is : ", position);
        if (
            Math.abs(position[0].buyQty - position[0].sellQty) < userTrade.quantity
        ) {
            throw new Error("Invalid Quantity");
        } else {
            const holdings = await SamcoGetPositions(user.demat_access_token as string);
            const holding = holdings.filter(
                (hold) =>
                    hold.exchange === "NSE"
    );

            if (holding.length === 0) {
                throw new Error("No trade found");
            }
            console.log("Found Position is : ", holding);
            if (holding[0].qty < userTrade.quantity) {
                throw new Error("Invalid Quantity");
            }

        }

        if (userTrade.has_sl && userTrade.broker_sl_status !== "CANCELLED") {
            const orderBook = await SamcoOrderBook(user.demat_access_token as string);
            const stoplossOrderWithSimilarity = orderBook.filter(
              (order) =>
                (order.ordertype === "SL" ||
                  order.ordertype === "SL-M") &&
                order.transactiontype === "SELL" &&
                order.exchange === "NSE" &&
                order.orderstatus === "Pending" &&
                order.productCode === "NRML"
            );
            console.log(
              "ORDER SIMILARITY FOR SL INTRADAY : ",
              stoplossOrderWithSimilarity
            );
            if (stoplossOrderWithSimilarity.length > 0) {
              await SamcoDeleteorderForSl(
                user.demat_access_token as string,
                userTrade.broker_sl_id
              );
              userTrade.broker_sl_status = "CANCELLED";
              await userTrade.save();
            }
          }



    }

}


