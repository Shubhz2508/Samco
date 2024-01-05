import { UUIDV4, Sequelize, Model, DataType, DataTypes } from "sequelize";
import { customAlphabet } from "nanoid";
import databases from "../Database/connection";
const nanoid = customAlphabet(
    "12345567890qwertyuioplkjhgfdsazxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ"
);
import Cryptr from "cryptr";
const cryptr = new Cryptr(process.env.DEMAT_SECRET);

class User extends Model {
    public fullname!: string;
    public phone_number!: string;
    public email!: string;
    public otp!: string;
    public gender!: string;
    public is_truecaller!: boolean;
    public is_verified!: boolean;
    public uuid!: string;
    public refresh_token!: string;
    public access_token!: string;
    public linked_demat!: string | null;
    public referral_code!: string;
    public referred_by!: string;
    public current_available_coins!: number;
    public device_details!: string;
    public notification_id!: string;
    public notification_password!: string;
    public friends_list!: string[];
    public friends_request_rev!: string[];
    public friends_request_sent!: string[];
    public demat_refresh_token!: string | null;
    public demat_access_token!: string | null;
    public demat_client_code!: string | null;
    public demat_password!: string | null;
    public demat_dob!: string | null;
    public trades_unlocked!: string[];
    public is_subscription!: string;
    public free_trades_available!: number;
    public free_trade_last_used!: string;
    public dp_updated_ts!: string;

    toJSON() {
        const PROTECTED_ATTRIBUTES: string[] = [
            "otp",
            "is_truecaller",
            "is_verified",
            "uuid",
            "refresh_token",
            "access_token",
            "referred_by",
            "id",
            "device_details",
            "updatedAt",
            "createdAt",
            "friends_list",
            "friends_request_rev",
            "friends_request_sent",
            "demat_refresh_token",
            "demat_access_token",
            "demat_client_code",
            "demat_password",
            "demat_dob",
            "trades_unlocked",
            "free_trade_last_used",
            "dp_updated_ts",
        ];
        let attributes = Object.assign({}, this.get());
        for (let id of PROTECTED_ATTRIBUTES) {
            delete attributes[id];
        }
        return attributes;
    }
}

User.init(
    {
        fullname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/i,
                lengthChecker(value: string) {
                    if (value.length > 255) {
                        throw new Error("Name cannot be longer than 255 characters");
                    }
                },
            },
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                lengthChecker(value: string) {
                    if (value.length !== 12) {
                        throw new Error("Invalid mobile number");
                    }
                    if (value[0] !== "9" || value[1] !== "1") {
                        throw new Error("Only indian mobile are supported");
                    }
                },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                lengthChecker(value: string) {
                    if (value.length > 255) {
                        throw new Error("Email cannot be longer than 255 characters");
                    }
                },
            },
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM({
                values: ["Male", "Female", "Others"],
            }),
            allowNull: false,
        },
        is_truecaller: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_verified: {
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
        refresh_token: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: null,
        },
        access_token: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: null,
        },
        linked_demat: {
            type: DataTypes.ENUM({
                values: ["ZERODHA", "ANGLEONE", "DHAN", "IIFLSECURITIES", "FYERS", "SAMCO"],
            }),
            allowNull: true,
        },
        referral_code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: nanoid(8),
        },
        referred_by: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                lengthChecker(value: string) {
                    if (value && value.length > 9) {
                        throw new Error("Referral code is invalid");
                    }
                },
            },
        },
        current_available_coins: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
        },
        device_details: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        notification_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        notification_password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        friends_list: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        friends_request_sent: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        friends_request_rev: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        demat_refresh_token: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            set(value) {
                if (typeof value === "string") {
                    const encrypted = cryptr.encrypt(value);
                    this.setDataValue("demat_refresh_token", encrypted);
                } else {
                    this.setDataValue("demat_refresh_token", value);
                }
            },
            get() {
                const rawValue = this.getDataValue("demat_refresh_token");
                return rawValue ? cryptr.decrypt(rawValue) : null;
            },
        },
        demat_access_token: {
            type: DataTypes.STRING(2048),
            allowNull: true,
            set(value) {
                if (typeof value === "string") {
                    const encrypted = cryptr.encrypt(value);
                    this.setDataValue("demat_access_token", encrypted);
                } else {
                    this.setDataValue("demat_access_token", value);
                }
            },
            get() {
                const rawValue = this.getDataValue("demat_access_token");
                return rawValue ? cryptr.decrypt(rawValue) : null;
            },
        },
        demat_client_code: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            set(value) {
                if (typeof value === "string") {
                    const encrypted = cryptr.encrypt(value);
                    this.setDataValue("demat_client_code", encrypted);
                } else {
                    this.setDataValue("demat_client_code", value);
                }
            },
            get() {
                const rawValue = this.getDataValue("demat_client_code");
                return rawValue ? cryptr.decrypt(rawValue) : null;
            },
        },
        demat_password: {
            type: DataTypes.STRING,
            allowNull: true,
            set(value) {
                if (typeof value === "string") {
                    const encrypted = cryptr.encrypt(value);
                    this.setDataValue("demat_password", encrypted);
                } else {
                    this.setDataValue("demat_password", value);
                }
            },
            get() {
                const rawValue = this.getDataValue("demat_password") as string;
                return rawValue ? cryptr.decrypt(rawValue) : null;
            },
        },
        demat_dob: {
            type: DataTypes.STRING,
            allowNull: true,
            set(value) {
                if (typeof value === "string") {
                    const encrypted = cryptr.encrypt(value);
                    this.setDataValue("demat_dob", encrypted);
                } else {
                    this.setDataValue("demat_dob", value);
                }
            },
            get() {
                const rawValue = this.getDataValue("demat_dob");
                return rawValue ? cryptr.decrypt(rawValue) : null;
            },
        },
        trades_unlocked: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: [],
            allowNull: true,
        },
        is_subscription: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        free_trades_available: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        free_trade_last_used: {
            type: DataTypes.STRING,
            defaultValue: "0",
        },
        dp_updated_ts: {
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: true,
        tableName: "users",
        sequelize: databases.userDatabase,
        modelName: "User",
    }
);

export default User;