import Trade from "../Models/Trade";
import UserTrades from "../Models/UserTrade";

export const getTradeAndUserTrade = async (
    tradeId: string,
    clientTradeId: string
) => {
    const trade = await Trade.findOne({ where: { trade_id: tradeId } });
    const userTrade = await UserTrades.findOne({
        where: { client_trade_uuid: clientTradeId },
    });
    return { trade, userTrade };
};