import { UUIDV4, Sequelize, Model, DataType, DataTypes } from "sequelize";
import { customAlphabet } from "nanoid";
import databases from "../Database/connection";
const nanoid = customAlphabet(
  "12345567890qwertyuioplkjhgfdsazxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ"
);

class Trade extends Model {
  public trade_id!: string;
  public variety!: string;
  public transaction_type!: string;
  public order_type!: string;
  public product_type!: string;
  public duration!: string;
  public exchange!: string;
  public trading_symbol!: string;
  public symbol_token!: string;
  public price!: string;
  public stop_loss!: string;
  public target!: string;
  public order_tag!: string;
  public risk!: number;
  public trade_icon!: string;
  public sector!: string;
  public holding_name!: string;
  public holding_period!: string;
  public expected_return!: string;
  public reward_ratio!: string;
  public show_trade!: boolean;
  public close_trade!: boolean;
  public is_updated!: boolean;
  public uuid!: string;
  public has_ended!: boolean;
  public admin_uuid!: string;
  public has_executed!: boolean;
  public has_sl!: boolean;
  public is_inactive!: boolean;
  public is_trend_following!: boolean;
  public is_btst!: boolean;

  toJSON() {
    const PROTECTED_ATTRIBUTES: string[] = [
      "variety",
      "transaction_type",
      "order_type",
      "product_type",
      "duration",
      "exchange",
      "symbol_token",
      "price",
      "stop_loss",
      "has_sl",
      "target",
      "order_tag",
      "show_trade",
      "has_ended",
      "close_trade",
      "has_executed",
      "is_updated",
      "uuid",
      "admin_uuid",
      "is_inactive",
      "is_btst",
      "is_trend_following",
    ];
    let attributes = Object.assign({}, this.get());
    for (let id of PROTECTED_ATTRIBUTES) {
      delete attributes[id];
    }
    return attributes;
  }
}

Trade.init(
  {
    trade_id: {
      type: DataTypes.STRING,
      defaultValue: nanoid(),
      allowNull: false,
      unique: true,
    },
    variety: {
      type: DataTypes.ENUM({
        values: ["NORMAL", "STOPLOSS", "AMO", "ROBO"],
      }),
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM({
        values: ["BUY", "SELL"],
      }),
      allowNull: false,
    },
    order_type: {
      type: DataTypes.ENUM({
        values: ["MARKET", "LIMIT", "STOPLOSS_LIMIT", "STOPLOSS_MARKET "],
      }),
      allowNull: false,
    },
    expected_return: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_type: {
      type: DataTypes.ENUM({
        values: ["DELIVERY", "CARRYFORWARD", "MARGIN", "INTRADAY", "BO"],
      }),
      allowNull: false,
    },
    duration: {
      type: DataTypes.ENUM({
        values: ["DAY", "IOC"],
      }),
      allowNull: false,
    },
    exchange: {
      type: DataTypes.ENUM({
        values: ["BSE", "NSE", "NFO", "MCX"],
      }),
      allowNull: false,
    },
    trading_symbol: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    symbol_token: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    stop_loss: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order_tag: {
      type: DataTypes.STRING,
      defaultValue: nanoid(),
      allowNull: false,
      unique: true,
    },
    risk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    trade_icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    holding_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    holding_period: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reward_ratio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    show_trade: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    has_executed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    close_trade: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    has_ended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    has_sl: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_updated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_inactive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_btst: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_trend_following: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    admin_uuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "trades",
    sequelize: databases.brokersDatabase,
    modelName: "Trade",
  }
);

export default Trade;
