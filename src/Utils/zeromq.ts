import { Publisher } from "zeromq";

export const sock = new Publisher();
sock.bind("tcp://127.0.0.1:6001");

console.log("Publisher bound to port 6001");

export const publishMessage = (
  broker: string,
  user_id: string,
  brokerOrderId: string,
  accessDematToken: string
) => {
  const body = { broker, user_id, brokerOrderId, accessDematToken };
  sock.send(["check_sell", JSON.stringify(body)]);
};