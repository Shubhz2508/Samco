import cryptr from "cryptr";

export const decryptr = (secret: string, data: string) => {
    const decrypter = new cryptr(secret);
    return decrypter.decrypt(data);
};

export const encryptr = (secret: string, data: string) => {
    const encrypter = new cryptr(secret);
    return encrypter.encrypt(data);
};