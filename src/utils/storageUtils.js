import {aesDecrypt, aesEncrypt, base64Decode, base64Encode, bytesToString} from "@waves/ts-lib-crypto";


let storageUtils = {
    read(key) {
        return window.localStorage.getItem(key);
    },

    write(key, value) {
        window.localStorage.setItem(key, value)
    },

    readAndDecrypt(key, secret) {
        let encrypted = this.read(key);
        if (!encrypted) {
            return null;
        }
        return bytesToString(aesDecrypt(base64Decode(encrypted), secret))
    },

    encryptAndWrite(key, value, secret) {

        this.write(key, base64Encode(aesEncrypt(value, secret)));
    },

    checkKey(key) {
        return window.localStorage.getItem(key) != null;
    }
};

export default storageUtils;