import { nanoid } from "nanoid";
import { createClient } from "redis";

export const communicatorRedis = createClient({
  url: "rediss://red-cie8op5iuie358k9p5og:Bkp6OeDoV3VhIdPsD4Voo620Lx04XGhH@singapore-redis.render.com:6379",
});

communicatorRedis.connect();

export const addUserToCheckListForBuy = async (
  accessToken: string,
  tradeSymbol: string,
  orderId: string,
  quantity: string,
  tradeId: string
) => {
  const prevBuyers = await communicatorRedis.get(`${tradeId}_buyers_fyers`);
  const userData = {
    accessToken: accessToken,
    tradeSymbol: tradeSymbol,
    orderId: orderId,
    quantity: quantity,
    tradeId: tradeId,
    id: nanoid(8),
  };
  try {
    if (prevBuyers) {
      const allBuyers = [...JSON.parse(prevBuyers), userData];
      await communicatorRedis.set(
        `${tradeId}_buyers_fyers`,
        JSON.stringify(allBuyers)
      );
    } else {
      await communicatorRedis.set(
        `${tradeId}_buyers_fyers`,
        JSON.stringify([userData])
      );
    }
  } catch (err) {
    console.log(" I got some issues : ", err);
    if (prevBuyers) {
      const allBuyers = [...JSON.parse(prevBuyers), userData];
      await communicatorRedis.set(
        `${tradeId}_buyers_fyers`,
        JSON.stringify(allBuyers)
      );
    } else {
      await communicatorRedis.set(
        `${tradeId}_buyers_fyers`,
        JSON.stringify([userData])
      );
    }
  }
};