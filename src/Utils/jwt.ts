import jwt from "jsonwebtoken";
import { decryptr, encryptr } from "./crypter";

export const issueJWT = (data: object, exp: string, toEncrypt: boolean) => {
    let token = jwt.sign({ ...data }, process.env.JWT_SECRET, {
        expiresIn: exp,
    });
    if (toEncrypt) {
        token = encryptr(process.env.HIDE_JWT_SECRET, token);
    }
    return token;
};

export const verifyJWT = (token: string, isEncrypted: boolean) => {
    let jwtString = token;
    if (isEncrypted) {
        jwtString = decryptr(process.env.HIDE_JWT_SECRET, token);
    }
    let data = jwt.verify(jwtString, process.env.JWT_SECRET);
    return data;
};