import Binance from "binance-api-node";
import config from "./config";

const client = Binance.default({
  apiKey: config.apiKey,
  apiSecret: config.apiSecret,
});

const pricePrecision = {
  BTCUSDT: 1,
  BNBUSDT: 2,
  ETHUSDT: 2,
  XRPUSDT: 4,
  LINKUSDT: 3,
  GMTUSDT: 4,
  DARUSDT: 3,
  REEFUSDT: 6,
  DUSKUSDT: 5,
  APEUSDT: 3,
  MKRUSDT: 1,
};

const contractPrecision = {
  BTCUSDT: 3,
  BNBUSDT: 2,
  ETHUSDT: 3,
  XRPUSDT: 1,
  LINKUSDT: 2,
  DARUSDT: 1,
  REEFUSDT: 0,
  DUSKUSDT: 0,
  APEUSDT: 0,
  GMTUSDT: 0,
  MKRUSDT: 3,
};

const roundToPrecision = (num, precision) =>
  Number(num.toFixed(precision));

export const handleWebhook = async (req, res) => {
  const { body } = req;
  const { symbol, strategy } = body;

  console.log("----RECEIVING order----");
  console.log("alert", body);

  if (!symbol) {
    return res.json({ message: "ok" });
  }

  try {
    const { order_id, order_contracts, meta_data, order_action, strategy_action, use_limit_tp_sl } = strategy;

    if (order_id.includes("TP") || order_id.includes("SL")) {
      console.log("---TP/SL order ignore---");
      return res.json({ message: "ok" });
    }

    const quantity = roundToPrecision(
      Number(order_contracts),
      contractPrecision[symbol] ?? 8
    );

    const take_profit_price = roundToPrecision(
      Number(meta_data?.tp_price || 0),
      pricePrecision[symbol] ?? 8
    );

    const stop_loss_price = roundToPrecision(
      Number(meta_data?.sl_price || 0),
      pricePrecision[symbol] ?? 8
    );

    const side = order_action.toUpperCase();

    if (strategy_action === "entry") {
      console.log("---ENTRY Order Starting---");
      console.log("options", {
        symbol,
        side,
        type: "MARKET",
        quantity,
      });

      const result = await client.futuresOrder({
        symbol,
        side,
        type: "MARKET",
        quantity,
      });

      console.log("---ENTRY Order successful---");
      console.log("---ENTRY Order Result---", result);

      if (take_profit_price) {
        const tp_side = side === "BUY" ? "SELL" : "BUY";

        console.log
