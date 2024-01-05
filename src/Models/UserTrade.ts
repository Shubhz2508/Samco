import { UUIDV4, Sequelize, Model, DataType, DataTypes } from "sequelize";
import { customAlphabet } from "nanoid";
import databases from "../Database/connection";
const nanoid = customAlphabet(
  "12345567890qwertyuioplkjhgfdsazxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ"
);

class UserTrades extends Model {
  public user_uuid!: string;
  public user_notification_id!: string;
  public trade_uuid!: string;
  public current_status!: string;
  public is_updated!: boolean;
  public quantity!: number;
  public has_sl!: boolean;
  public brokerage!: boolean;
  public broker_order_id!: string;
  public uuid!: string;
  public client_trade_uuid!: string;
  public price!: string;
  public exit_price!: string;
  public trade_type!: string;
  public broker_sl_id!: string;
  public broker_exit_id!: string;
  public has_sent_sl_notification!: boolean;
  public has_sent_exit_notitification!: boolean;
  public has_sent_cancel_notification!: boolean;
  public has_sent_entry_notification!: boolean;
  public demat_client_id!: string;
  public sl_value!: string;
  public broker_sl_status!: string;
  public broker_exit_status!: string;

  toJSON() {
    const PROTECTED_ATTRIBUTES: string[] = [
      "user_uuid ",
      "user_notification_id",
      "trade_uuid",
      "current_status",
      "is_updated",
      "has_sl",
      "brokerage",
      "broker_order_id",
      "client_trade_uuid",
      "uuid",
      "broker_exit_id",
      "broker_sl_id",
      "has_sent_sl_notification",
      "has_sent_exit_notitification",
      "has_sent_entry_notification",
      "has_sent_cancel_notification",
      "demat_client_id",
      "sl_value",
      "broker_sl_status",
      "broker_exit_status",
    ];
    let attributes = Object.assign({}, this.get());
    for (let id of PROTECTED_ATTRIBUTES) {
      delete attributes[id];
    }
    return attributes;
  }
}

UserTrades.init(
  {
    user_uuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_notification_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    has_sent_sl_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_sent_exit_notitification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_sent_entry_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_sent_cancel_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    trade_uuid: {
      //Refers to as a foreign key from Trades table
      type: DataTypes.UUID,
      allowNull: false,
    },
    broker_exit_status: {
      type: DataTypes.ENUM({
        values: [
          "PENDING",
          "EXECUTED",
          "TRADED",
          "CANCELLED",
          "EXPIRED",
          "NT",
          "REJECTED",
          "NOT_EXECUTED",
        ],
      }),
      allowNull: true,
    },
    broker_sl_status: {
      type: DataTypes.ENUM({
        values: [
          "PENDING",
          "EXECUTED",
          "TRADED",
          "CANCELLED",
          "EXPIRED",
          "NT",
          "REJECTED",
          "NOT_EXECUTED",
        ],
      }),
      allowNull: true,
    },
    current_status: {
      type: DataTypes.ENUM({
        values: [
          "PENDING",
          "EXECUTED",
          "TRADED",
          "CANCELLED",
          "EXPIRED",
          "NT",
          "REJECTED",
          "NOT_EXECUTED",
        ],
      }),
      allowNull: false,
    },
    is_updated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    has_sl: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sl_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brokerage: {
      type: DataTypes.ENUM({
        values: ["ZERODHA", "ANGLEONE", "DHAN", "IIFLSECURITIES", "FYERS", "SAMCO"],
      }),
      allowNull: false,
    },
    broker_order_id: {
      //ORDER ID SENT FROM BROKER
      type: DataTypes.STRING,
      allowNull: false,
    },
    demat_client_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uuid: {
      // OUR DATABASE UNIQUE ID TO REMEMBER TRADE [USED FOR INTERNAL REFS]
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    client_trade_uuid: {
      // ID TO SENT TO USER FOR HIS/HER PURPOSE OF WORK [USED FOR EXTERNAL REFS]
      type: DataTypes.STRING,
      defaultValue: nanoid(),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    exit_price: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    trade_type: {
      type: DataTypes.ENUM({
        values: ["BUY", "SELL"],
      }),
      allowNull: false,
    },
    broker_sl_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    broker_exit_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "user_trades",
    sequelize: databases.brokersDatabase,
    modelName: "UserTrade",
  }
);

export default UserTrades;